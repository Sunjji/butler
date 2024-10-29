/* eslint-disable @next/next/no-img-element */
"use client";

import api from "@/api/api";
import { supabase } from "@/supabase/client";
import { Pet } from "@/types/type";
import { useAuthStore } from "@/zustand/auth.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { useState } from "react";
import { toast } from "react-toastify";
import { getToastOptions } from "../../_components/getToastOptions";

function AllPets() {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.currentUserId);

  const { mutate: deletePets } = useMutation({
    mutationFn: api.pets.deleteMyPets,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pets"], exact: true }),
    mutationKey: ["deletePets"],
  });

  const { mutate: updatePet } = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<Pet>) => {
      const response = await supabase.from("pets").update(data).eq("id", id);
      return response.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pets"], exact: true }),
    mutationKey: ["updatePets"],
  });

  const { data: pets = [] } = useQuery({
    queryKey: ["pets"],
    enabled: !!currentUserId,
    queryFn: () => api.pets.getMyPets(currentUserId!),
  });

  const handleClickDeletePets = (petId: number) => {
    deletePets(petId);
    toast("💚 반려동물이 삭제 되었습니다", getToastOptions("success"));
  };

  const [editingPetId, setEditingPetId] = useState<number | null>(null);
  const [formState, setFormState] = useState({
    weight: 1,
    age: 1,
    gender: "",
    name: "",
    comment: "",
    breed: "",
    imageFile: undefined as File | undefined,
    imageUrl: "",
    birth: "", // 생일 필드 추가
  });

  const handleEditClick = (pet: Pet) => {
    setEditingPetId(pet.id);
    setFormState({
      weight: pet.weight,
      age: pet.age,
      gender: pet.gender,
      name: pet.name,
      comment: pet.comment,
      breed: pet.breed,
      birth: pet.birth,
      imageFile: undefined,
      imageUrl: pet.imageUrl,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent, petId: number) => {
    e.preventDefault();

    let imageFixPath = formState.imageUrl;

    if (formState.imageFile) {
      const extension = formState.imageFile.name.split(".").pop();
      const filename = `${nanoid()}.${extension}`;
      const { data, error } = await supabase.storage
        .from("pets")
        .upload(filename, formState.imageFile, { upsert: true });

      if (error) {
        return toast(
          "❤️ 반려동물 사진이 수정되지 않았습니다",
          getToastOptions("error")
        );
      }

      imageFixPath = data?.fullPath || "";
    }

    const updatedPet: Partial<Pet> = {
      weight: formState.weight,
      age: formState.age,
      gender: formState.gender,
      name: formState.name,
      comment: formState.comment,
      breed: formState.breed,
      birth: formState.birth,
      imageUrl: imageFixPath,
    };

    updatePet({ id: petId, ...updatedPet });
    setEditingPetId(null);
    toast("💚 프로필 수정이 완료되었습니다", getToastOptions("success"));
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {pets?.map((pet) =>
        editingPetId === pet.id ? (
          <li
            key={pet.id}
            className="flex flex-col items-center border p-4 w-full"
          >
            <form onSubmit={(e) => handleFormSubmit(e, pet.id)}>
              <h2 className="text-3xl">반려동물 수정 모드</h2>
              {formState.imageUrl && (
                <img
                  src={`https://kudrchaizgkzyjzrkhhy.supabase.co/storage/v1/object/public/${formState.imageUrl}`}
                  alt={pet.name}
                  className="w-32 h-32 object-cover mb-2"
                />
              )}
              <input
                name="image"
                type="file"
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    imageFile: e.target.files?.[0],
                  }))
                }
              />
              <input
                value={formState.name}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, name: e.target.value }))
                }
                name="name"
                type="text"
              />
              <div>
                <label>수컷</label>
                <input
                  checked={formState.gender === "수컷"}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      gender: e.target.value,
                    }))
                  }
                  name="gender"
                  value="수컷"
                  type="radio"
                />
                <label>암컷</label>
                <input
                  checked={formState.gender === "암컷"}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      gender: e.target.value,
                    }))
                  }
                  name="gender"
                  value="암컷"
                  type="radio"
                />
              </div>
              <input
                value={formState.age}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    age: Number(e.target.value),
                  }))
                }
                name="age"
                type="number"
              />
              <input
                value={formState.weight}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    weight: Number(e.target.value),
                  }))
                }
                name="weight"
                type="number"
              />
              <input
                value={formState.breed}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    breed: e.target.value,
                  }))
                }
                name="breed"
                type="text"
                placeholder="품종 입력"
              />
              <input
                value={formState.comment}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                name="comment"
                type="text"
              />
              <input
                value={formState.birth}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    birth: e.target.value,
                  }))
                }
                name="birth"
                type="date"
              />
              <button type="submit">저장하기</button>
              <button type="button" onClick={() => setEditingPetId(null)}>
                취소
              </button>
            </form>
          </li>
        ) : (
          <li
            key={pet.id}
            className="flex flex-col items-center border p-4 w-full"
          >
            <h2>{pet.name}</h2>
            <img
              className="w-32 h-32 object-cover rounded-md mb-4"
              src={`https://kudrchaizgkzyjzrkhhy.supabase.co/storage/v1/object/public/${pet.imageUrl}`}
              alt={pet.name}
            />
            <p>몸무게 : {pet.weight}</p>
            <p>나이 : {pet.age}</p>
            <p>성별 : {pet.gender}</p>
            <p>품종 : {pet.breed}</p>
            <p>한 줄 소개 : {pet.comment}</p>
            <p>생일 : {pet.birth}</p>
            <div className="flex justify-between gap-5">
              <button
                className="border border-black px-2 py-1 rounded-lg"
                onClick={() => handleEditClick(pet)}
              >
                반려동물 수정
              </button>
              <button
                className="border border-black px-2 py-1 rounded-lg"
                onClick={() => handleClickDeletePets(pet.id)}
              >
                반려동물 삭제
              </button>
            </div>
          </li>
        )
      )}
    </div>
  );
}

export default AllPets;
