"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Search,
  FileArchive,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface DownloadFile {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileName: string;
  fileUrl: string;
  fileSize: string | null;
  fileType: string | null;
  version: string | null;
  thumbnailUrl: string | null;
  systemRequirements: string | null;
  downloadCount: number;
  tags: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { value: "biometric", label: "Biometric" },
  { value: "electronics", label: "Electronics" },
  { value: "computer_peripherals", label: "Computer & Peripherals" },
  { value: "gps_devices", label: "GPS Devices" },
  { value: "rd_service", label: "RD Service" },
  { value: "software", label: "Software" },
  { value: "encrypted_token", label: "Encrypted Token" },
  { value: "forms", label: "Forms" },
];

export default function AdminDownloadsPage() {
  const { status: sessionStatus, data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<DownloadFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; title: string } | null>(null);
  const [editingFile, setEditingFile] = useState<DownloadFile | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    fileName: "",
    fileUrl: "",
    fileSize: "",
    fileType: "",
    version: "",
    thumbnailUrl: "",
    systemRequirements: "",
    tags: "",
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not admin
  if (
    mounted &&
    (sessionStatus === "unauthenticated" || session?.user?.role !== "admin")
  ) {
    redirect("/");
  }

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.role === "admin") {
      fetchFiles();
    }
  }, [sessionStatus, session]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/downloads?includeInactive=true");
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      toast.error("Failed to load files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (file?: DownloadFile) => {
    if (file) {
      setEditingFile(file);
      setFormData({
        title: file.title,
        description: file.description || "",
        category: file.category,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize || "",
        fileType: file.fileType || "",
        version: file.version || "",
        thumbnailUrl: file.thumbnailUrl || "",
        systemRequirements: file.systemRequirements || "",
        tags: file.tags || "",
        isActive: file.isActive,
        isFeatured: file.isFeatured,
        displayOrder: file.displayOrder,
      });
    } else {
      setEditingFile(null);
      setFormData({
        title: "",
        description: "",
        category: "",
        fileName: "",
        fileUrl: "",
        fileSize: "",
        fileType: "",
        version: "",
        thumbnailUrl: "",
        systemRequirements: "",
        tags: "",
        isActive: true,
        isFeatured: false,
        displayOrder: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingFile ? "/api/downloads" : "/api/downloads";
      const method = editingFile ? "PUT" : "POST";

      const payload = editingFile
        ? { id: editingFile.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          editingFile ? "File updated successfully" : "File added successfully"
        );
        setDialogOpen(false);
        fetchFiles();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save file");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;

    try {
      const response = await fetch(`/api/downloads?id=${fileToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("File deleted successfully");
        fetchFiles();
      } else {
        toast.error("Failed to delete file");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const toggleActive = async (file: DownloadFile) => {
    try {
      const response = await fetch("/api/downloads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: file.id, isActive: !file.isActive }),
      });

      if (response.ok) {
        toast.success(file.isActive ? "File hidden" : "File activated");
        fetchFiles();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!mounted || sessionStatus === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ECommerceHeader />
      <main className="flex-1 bg-muted/40">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">File Management</h1>
              <p className="text-muted-foreground">
                Manage downloadable files, drivers, and software
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New File
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Files List */}
          {isLoading ? (
            <div className="text-center py-12">Loading files...</div>
          ) : filteredFiles.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileArchive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No files found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-24 bg-muted rounded flex-shrink-0 overflow-hidden">
                        {file.thumbnailUrl ? (
                          <Image
                            src={file.thumbnailUrl}
                            alt={file.title}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileArchive className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{file.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {file.fileName}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={file.isActive ? "default" : "secondary"}>
                              {file.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {file.isFeatured && (
                              <Badge variant="outline">Featured</Badge>
                            )}
                          </div>
                        </div>

                        {file.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {file.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          <span>
                            Category:{" "}
                            {categories.find((c) => c.value === file.category)?.label}
                          </span>
                          {file.version && <span>Version: {file.version}</span>}
                          {file.fileSize && <span>Size: {file.fileSize}</span>}
                          {file.fileType && (
                            <Badge variant="secondary">{file.fileType}</Badge>
                          )}
                          <span>{file.downloadCount} downloads</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(file)}
                            className="gap-2"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleActive(file)}
                            className="gap-2"
                          >
                            {file.isActive ? (
                              <>
                                <EyeOff className="h-3 w-3" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3" />
                                Show
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.fileUrl, "_blank")}
                            className="gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setFileToDelete({ id: file.id, title: file.title });
                              setDeleteDialogOpen(true);
                            }}
                            className="gap-2"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFile ? "Edit File" : "Add New File"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the downloadable file
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fileName">File Name *</Label>
                <Input
                  id="fileName"
                  value={formData.fileName}
                  onChange={(e) =>
                    setFormData({ ...formData, fileName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="fileUrl">File URL *</Label>
                <Input
                  id="fileUrl"
                  value={formData.fileUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, fileUrl: e.target.value })
                  }
                  placeholder="https://example.com/file.zip"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fileSize">File Size</Label>
                <Input
                  id="fileSize"
                  value={formData.fileSize}
                  onChange={(e) =>
                    setFormData({ ...formData, fileSize: e.target.value })
                  }
                  placeholder="e.g., 2.5 MB"
                />
              </div>

              <div>
                <Label htmlFor="fileType">File Type</Label>
                <Input
                  id="fileType"
                  value={formData.fileType}
                  onChange={(e) =>
                    setFormData({ ...formData, fileType: e.target.value })
                  }
                  placeholder="e.g., ZIP, EXE, PDF"
                />
              </div>

              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  placeholder="e.g., 1.0.0"
                />
              </div>

              <div>
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnailUrl: e.target.value })
                  }
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="systemRequirements">System Requirements</Label>
                <Textarea
                  id="systemRequirements"
                  value={formData.systemRequirements}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      systemRequirements: e.target.value,
                    })
                  }
                  placeholder="e.g., Windows 10/11, 4GB RAM"
                  rows={2}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="driver, biometric, windows"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Featured
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingFile ? "Update File" : "Add File"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{fileToDelete?.title}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
