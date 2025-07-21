
import { AppWrapper } from "@/components/AppWrapper";
import SerpApi from "@/components/SerpApi";
import WebScraper from "@/components/WebScraper";
import ApiKeyGenerator from "@/components/ApiKeyGenerator";

const Index = () => {
  return (
    <div>
      <AppWrapper />
      <SerpApi />
      <WebScraper />
      <ApiKeyGenerator />
    </div>
  );
};

export default Index;
