import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesPage } from "./pages/FavoritesPage";
import { LoginPage } from "./pages/LoginPage";
import { MealPlanPage } from "./pages/MealPlanPage";
import { OAuthCallbackPage } from "./pages/OAuthCallbackPage";
import { RecipeDetailPage } from "./pages/RecipeDetailPage";
import { RecipeFormPage } from "./pages/RecipeFormPage";
import { RecipesListPage } from "./pages/RecipesListPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ShoppingListPage } from "./pages/ShoppingListPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { UserSearchPage } from "./pages/UserSearchPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<RecipesListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/recipes/new" element={<RecipeFormPage />} />
            <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/meal-plan" element={<MealPlanPage />} />
            <Route path="/shopping-list" element={<ShoppingListPage />} />
            <Route path="/search" element={<UserSearchPage />} />
            <Route path="/users/:id" element={<UserProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
