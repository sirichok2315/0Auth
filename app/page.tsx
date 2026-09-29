import ProductExplorer from "./components/ProductExplorer";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <ProductExplorer 
      isLoggedIn={isLoggedIn} 
      userName={session?.user?.name} 
    />
  );
}