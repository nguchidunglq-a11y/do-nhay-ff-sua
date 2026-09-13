import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";

export default function App() {
  // make sure to consider if you need authentication for certain routes
  return (
    <>
      <Home />
      <Toaster position="bottom-right" />
    </>
  );
}
