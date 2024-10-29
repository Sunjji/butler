import Page from "@/app/(providers)/(root)/_components/Page/Page";
import { supabase } from "@/supabase/client";
import DiariesWriteButton from "../_components/DiariesWriteButton";
import MyCalendar from "./_components/MyCalendar";

async function UserViewPage() {
  const { data } = await supabase.auth.getUser();
  const authorId = data.user?.id;
  if (!authorId) return;
  await supabase.from("diaries").select().eq("authorId", authorId);

  return (
    <Page title="나의 집사 일기">
      <div className="absolute top-20 right-[84px]">
        <DiariesWriteButton />
      </div>
      <div className="bg-whitePoint rounded-2xl">
        <div className="text-3xl font-bold text-BrownPoint text-center text-opacity-50 pb-[30px] flex justify-between mx-auto w-80">
          <MyCalendar />
        </div>
      </div>
    </Page>
  );
}
export default UserViewPage;
