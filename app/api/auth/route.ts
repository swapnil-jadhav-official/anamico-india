
import { publicProcedure, router } from './[...nextauth]/route';

const appRouter = router({
  // Define your authentication-related procedures here
});

export type AppRouter = typeof appRouter;
