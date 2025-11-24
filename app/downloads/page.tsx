"use client";

import { useState, useEffect } from "react";
import { ECommerceHeader } from "@/components/e-commerce-header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Search,
  FileText,
  HardDrive,
  Fingerprint,
  Laptop,
  MapPin,
  Lock,
  FileCode,
  FileArchive,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

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
  isFeatured: boolean;
}

const categories = [
  { id: "all", name: "All Downloads", icon: FileArchive },
  { id: "biometric", name: "Biometric", icon: Fingerprint },
  { id: "electronics", name: "Electronics", icon: HardDrive },
  { id: "computer_peripherals", name: "Computer & Peripherals", icon: Laptop },
  { id: "gps_devices", name: "GPS Devices", icon: MapPin },
  { id: "rd_service", name: "RD Service", icon: Fingerprint },
  { id: "software", name: "Software", icon: FileCode },
  { id: "encrypted_token", name: "Encrypted Token", icon: Lock },
  { id: "forms", name: "Forms", icon: FileText },
];

export default function DownloadsPage() {
  const [files, setFiles] = useState<DownloadFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<DownloadFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [files, selectedCategory, searchQuery]);

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/downloads");
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      toast.error("Failed to load downloads");
    } finally {
      setLoading(false);
    }
  };

  const filterFiles = () => {
    let filtered = files;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((file) => file.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.title.toLowerCase().includes(query) ||
          file.description?.toLowerCase().includes(query) ||
          file.fileName.toLowerCase().includes(query) ||
          file.tags?.toLowerCase().includes(query)
      );
    }

    setFilteredFiles(filtered);
  };

  const handleDownload = async (file: DownloadFile) => {
    try {
      // Increment download count
      await fetch(`/api/downloads/${file.id}/download`, {
        method: "POST",
      });

      // Open download link
      window.open(file.fileUrl, "_blank");
      toast.success(`Downloading ${file.title}`);
    } catch (error) {
      toast.error("Failed to start download");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ECommerceHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-background via-background to-accent/5 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Downloads Center
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Find all types of latest drivers, software, and forms at this section
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for drivers, software, or files..."
                  className="pl-12 h-14 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-8 border-b bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "default" : "outline"
                    }
                    className="gap-2"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Files Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading downloads...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <FileArchive className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No files found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "No downloads available in this category"}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    Showing {filteredFiles.length} {filteredFiles.length === 1 ? "file" : "files"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFiles.map((file) => (
                    <Card
                      key={file.id}
                      className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-48 bg-muted overflow-hidden">
                        {file.thumbnailUrl ? (
                          <Image
                            src={file.thumbnailUrl}
                            alt={file.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <FileArchive className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                        {file.isFeatured && (
                          <Badge className="absolute top-2 right-2 bg-primary">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4">
                        {/* Title */}
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {file.title}
                        </h3>

                        {/* Description */}
                        {file.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {file.description}
                          </p>
                        )}

                        {/* File Details */}
                        <div className="space-y-2 mb-4 text-sm">
                          {file.version && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                v{file.version}
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-muted-foreground">
                            {file.fileSize && <span>{file.fileSize}</span>}
                            {file.fileType && (
                              <Badge variant="secondary" className="text-xs">
                                {file.fileType}
                              </Badge>
                            )}
                          </div>
                          {file.downloadCount > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {file.downloadCount} downloads
                            </p>
                          )}
                        </div>

                        {/* Download Button */}
                        <Button
                          className="w-full gap-2"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>

                        {/* System Requirements */}
                        {file.systemRequirements && (
                          <p className="text-xs text-muted-foreground mt-3">
                            {file.systemRequirements}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
