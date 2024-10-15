"use client";

import { supabase } from "@/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";

type DiaryDetailPageProps = {
  params: {
    diaryId: string;
  };

  id: number;
  authorId: number;
  title: string;
  content: string;
  imageUrl: string;
  createAt: string;
  isPublic: boolean;
};
const baseURL =
  "https://kudrchaizgkzyjzrkhhy.supabase.co/storage/v1/object/public";

function DiaryDetailPage(props: DiaryDetailPageProps) {
  const [data, setData] = useState(props);
  const [isUser, setIsUser] = useState(false);

  // d09a1fd5-b8a1-4092-88d6-ef3c892f88df -> 1234
  // 5d94e981-16c8-4403-8e89-c305a7152c16 -> test
  useEffect(() => {
    (async () => {
      const response = await supabase
        .from("diaries")
        .select("*")
        .eq("id", Number(props.params.diaryId))
        .single();

      setData(response.data);

      const userResponse = await supabase.auth.getUser();
      const data = userResponse.data.user;
      const userId = data!.id;

      if (response.data.authorId === userId) return setIsUser(true);
    })();
  }, []);

  return (
    <div>
      <p>
        {/* 임시로 사진 사이즈 조절함 */}
        사진: <img className="w-32" src={`${baseURL}/${data.imageUrl}`} />
      </p>
      <p>제목: {data.title}</p>
      <p>내용: {data.content}</p>
      <p>글쓴이: {data.authorId}</p>

      {isUser ? (
        <Link
          className="border w-72 inline-block text-center active:brightness-75"
          href={`/diaries/${data.id}/detail/edit`}
        >
          편집하기
        </Link>
      ) : null}
    </div>
  );
}

export default DiaryDetailPage;