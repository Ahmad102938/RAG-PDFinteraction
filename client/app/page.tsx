import Image from "next/image";
import FileUpload from "./components/file-upload";
export default function Home() {
  return (
    <div>
      <div className="min-h-screen w-screen flex">
        <div className="w-[30vw] min-h-screen flex justify-center items-center p-4">
          <FileUpload />
        </div>
        <div className="w-[70vw] min-h-screen border-l-2 border-amber-50 ">2</div>
      </div>
    </div>
  );
}
