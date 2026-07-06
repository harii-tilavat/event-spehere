import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export function useHeroSection() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/events?search=${encodeURIComponent(q)}` : "/events");
  };

  return { search, setSearch, handleSubmit };
}
