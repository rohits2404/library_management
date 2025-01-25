"use client";

import { IKImage, ImageKitProvider, IKUpload, IKVideo } from "imagekitio-next";
import config from "@/lib/config";
import ImageKit from "imagekit";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const {
    env: {
        imagekit: { publicKey, urlEndpoint },
    },
} = config;

const authenticator = async () => {
    try {
        const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed with status ${response.status}: ${errorText}`,
            );
        }
        const data = await response.json();
        const { signature, expire, token } = data;
        return { token, expire, signature };
    } catch (error: any) {
        throw new Error(`Authentication request failed: ${error.message}`);
    }
}

interface Props {
    // type: "image" | "video";
    // accept: string;
    // placeholder: string;
    // folder: string;
    // variant: "dark" | "light";
    onFileChange: (filePath: string) => void;
    // value?: string;
};

const FileUpload = ({onFileChange}:Props) => {

    const ikUploadRef = useRef(null);

    const [file, setFile] = useState<{filePath: string }| null>(null)

    const [progress, setProgress] = useState(0);

    const onSuccess = (res: any) => {
        setFile(res);
        onFileChange(res.filePath);
        toast({
            title: `Image uploaded successfully`,
            description: `${res.filePath} uploaded successfully!`,
        });
    };

    const onError = (error: any) => {
        console.log(error);
        toast({
            title: `Imageupload failed`,
            description: `Your Image could not be uploaded. Please try again.`,
            variant: "destructive",
        });
    }
    
    return (
        <ImageKitProvider
        publicKey={publicKey}
        urlEndpoint={urlEndpoint}
        authenticator={authenticator}
        >
            <IKUpload
            ref={ikUploadRef}
            className="hidden"
            onSuccess={onSuccess}
            onError={onError}
            fileName="test-upload.png"
            />
            <button
            className="upload-btn"
            onClick={(e)=>{
                e.preventDefault();
                if (ikUploadRef.current) {
                    // @ts-ignore
                    ikUploadRef.current?.click();
                }
            }}
            >
                <Image src={"/icons/upload.svg"} alt="upload" width={20} height={20} className="object-contain"/>
                <p className="text-base text-light-100">Upload a File</p>
                {file && (
                    <p className="upload-filename">{file.filePath}</p>
                )}
            </button>
            {file && (
                <IKImage
                alt={file.filePath}
                path={file.filePath}
                width={500}
                height={300}
                />
            )}
        </ImageKitProvider>
    )
}

export default FileUpload