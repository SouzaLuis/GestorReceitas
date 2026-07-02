import axios from "axios";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createRecipe, getRecipe, updateRecipe } from "../api/recipes";
import { ListInput } from "../components/ListInput";
import type { RecipeFormValues } from "../types";

const EMPTY_FORM: RecipeFormValues = {
  title: "",
  description: "",
  category: "",
  prepTimeMinutes: "",
  servings: "",
  ingredients: [],
  instructions: "",
  image: null,
};

export function RecipeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const [form, setForm] = useState<RecipeFormValues>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getRecipe(Number(id)).then((recipe) => {
      setForm({
        title: recipe.title,
        description: recipe.description ?? "",
        category: recipe.category ?? "",
        prepTimeMinutes: recipe.prepTimeMinutes ? String(recipe.prepTimeMinutes) : "",
        servings: recipe.servings ? String(recipe.servings) : "",
        ingredients: recipe.ingredients,
        instructions: recipe.instructions.join("\n"),
        image: null,
      });
    });
  }, [id]);

  function handleChange(field: keyof RecipeFormValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, image: event.target.files?.[0] ?? null }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (form.ingredients.length === 0 || form.instructions.trim().length === 0) {
      setError("Adicione pelo menos um ingrediente e o modo de preparo.");
      return;
    }

    setLoading(true);
    try {
      const recipe = isEditing ? await updateRecipe(Number(id), form) : await createRecipe(form);
      navigate(`/recipes/${recipe.id}`);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Falha ao salvar receita")
        : "Falha ao salvar receita";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page page--narrow">
      <h1>{isEditing ? "Editar receita" : "Nova receita"}</h1>
      <form className="card" onSubmit={handleSubmit}>
        <label>
          Título
          <input value={form.title} onChange={handleChange("title")} required />
        </label>
        <label>
          Descrição
          <textarea value={form.description} onChange={handleChange("description")} />
        </label>
        <label>
          Categoria
          <input placeholder="Ex: sobremesa" value={form.category} onChange={handleChange("category")} />
        </label>
        <label>
          Tempo de preparo (min)
          <input
            type="number"
            min={1}
            value={form.prepTimeMinutes}
            onChange={handleChange("prepTimeMinutes")}
          />
        </label>
        <label>
          Porções
          <input type="number" min={1} value={form.servings} onChange={handleChange("servings")} />
        </label>
        <ListInput
          label="Ingredientes"
          placeholder="Digite um ingrediente e pressione Enter"
          items={form.ingredients}
          onChange={(ingredients) => setForm((prev) => ({ ...prev, ingredients }))}
        />
        <label>
          Modo de preparo
          <textarea
            placeholder="Descreva o passo a passo, pressione Enter para quebrar linhas"
            value={form.instructions}
            onChange={handleChange("instructions")}
          />
        </label>
        <label>
          Imagem
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </main>
  );
}
