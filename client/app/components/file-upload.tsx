"use client"
import * as React from 'react';
import { Upload } from "lucide-react";

const FileUpload:React.FC = () => {
    const handeleFileUploadButtonClick = () => {
        const element = document.createElement("input");
        element.setAttribute("type", "file");
        element.setAttribute("accept", "application/pdf");
        element.addEventListener("change", async (event) => {
            if(element.files && element.files.length>0) {
                const file = element.files.item(0);
                if(file){
                    const formData = new FormData();
                    formData.append('pdf', file)   

                    await fetch('http://localhost:8000/upload/pdf', {
                        method: 'POST',
                        body: formData,
                    })

                    console.log('file uploaded', file);
                }
            }
        })
        element.click();
    }
    return (
        <div className="bg-slate-500 text-white shadow-2xl rounded-lg justify-center items-center p-4  w-full flex">
            <div onClick={handeleFileUploadButtonClick} className=' flex justify-center items-center flex-col w-full'>
                <h3>upload your PDF</h3>
                <Upload  />
            </div>
        </div>
    )
}

export default FileUpload;