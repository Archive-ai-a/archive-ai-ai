import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Directory from "@/pages/Directory";
import ToolDetail from "@/pages/ToolDetail";
import CategoriesPage from "@/pages/CategoriesPage";
import CareerPacks from "@/pages/CareerPacks";
import CareerPackDetail from "@/pages/CareerPackDetail";
import MoneyGuides from "@/pages/MoneyGuides";
import Roadmap from "@/pages/Roadmap";
import Prompts from "@/pages/Prompts";
import Compare from "@/pages/Compare";
import AuthPage from "@/pages/AuthPage";
import Bookmarks from "@/pages/Bookmarks";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminShell from "@/pages/admin/AdminShell";
import "@/App.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin routes without the public layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminShell />} />

          {/* Public routes with the standard layout */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tools" element={<Directory />} />
                  <Route path="/tools/:slug" element={<ToolDetail />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/packs" element={<CareerPacks />} />
                  <Route path="/packs/:slug" element={<CareerPackDetail />} />
                  <Route path="/money" element={<MoneyGuides />} />
                  <Route path="/roadmap" element={<Roadmap />} />
                  <Route path="/prompts" element={<Prompts />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/login" element={<AuthPage mode="login" />} />
                  <Route path="/register" element={<AuthPage mode="register" />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}
