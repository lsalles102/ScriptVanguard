import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./context/LanguageContext";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Guide from "./pages/Guide";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/not-found";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import RegisterSuccess from "./pages/Auth/RegisterSuccess";
import ResetPassword from "./pages/Auth/ResetPassword";
import NewPassword from "./pages/Auth/NewPassword";

// Admin Pages
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminThemes from "./pages/Admin/Themes";
import AdminAssets from "./pages/Admin/Assets";
import AdminSettings from "./pages/Admin/Settings";
import AdminProducts from "./pages/Admin/Products";
import AdminHwidManager from "./pages/Admin/HwidManager";
import AdminUsers from "./pages/Admin/Users";
import AdminOrders from "./pages/Admin/Orders";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <LanguageProvider>
          <TooltipProvider>
            <div className="flex flex-col min-h-screen">
              <div className="scanline"></div>
              <Header />
              <main className="flex-grow">
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/products" component={Products} />
                  <Route path="/products/:slug" component={ProductDetail} />
                  <Route path="/guide" component={Guide} />
                  <Route path="/reviews" component={Reviews} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" component={Login} />
                  <Route path="/registrar" component={Register} />
                  <Route path="/registro-concluido" component={RegisterSuccess} />
                  <Route path="/recuperar-senha" component={ResetPassword} />
                  <Route path="/nova-senha" component={NewPassword} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" component={AdminDashboard} />
                  <Route path="/admin/products" component={AdminProducts} />
                  <Route path="/admin/hwid" component={AdminHwidManager} />
                  <Route path="/admin/users" component={AdminUsers} />
                  <Route path="/admin/orders" component={AdminOrders} />
                  <Route path="/admin/themes" component={AdminThemes} />
                  <Route path="/admin/assets" component={AdminAssets} />
                  <Route path="/admin/settings" component={AdminSettings} />
                  
                  <Route component={NotFound} />
                </Switch>
              </main>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
