"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { CloudUploadIcon, EyeIcon, ImageIcon, Loader2, TrashIcon, XIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Progress } from '../ui/progress';
import Image from 'next/image';

interface MultipleUploaderProps {
    value?: string[];
    onChange?: (value: string[]) => void;
    disabled?: boolean;
    maxFiles?: number;
    minFiles?: number;
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    previewUrl: string;
}

export function MultipleUploader({ 
    value = [], 
    onChange, 
    disabled = false, 
    maxFiles = 10, 
    minFiles = 1 
}: MultipleUploaderProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

    const uploadFile = useCallback(async (file: File) => {
        const uploadId = Math.random().toString(36).substring(7);
        const objectUrl = URL.createObjectURL(file);
        
        // Add to uploading files
        const uploadingFile: UploadingFile = {
            id: uploadId,
            file,
            progress: 0,
            previewUrl: objectUrl
        };
        
        setUploadingFiles(prev => [...prev, uploadingFile]);
        
        try {
            // Get pre-signed URL from server
            const response = await fetch('/api/s3/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type,
                    size: file.size,
                    isImage: true,
                    isPdf: false,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get upload URL');
            }

            const { preSignedUrl, key } = await response.json();

            // Upload to S3 with progress tracking
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadingFiles(prev => 
                        prev.map(f => f.id === uploadId ? { ...f, progress } : f)
                    );
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200 || xhr.status === 204) {
                    // Remove from uploading files
                    setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
                    
                    // Add to uploaded files
                    const newValue = [...value, key];
                    onChange?.(newValue);
                    
                    toast.success(`${file.name} uploaded successfully`);
                } else {
                    throw new Error('Upload failed');
                }
            });

            xhr.addEventListener('error', () => {
                throw new Error('Upload failed');
            });

            xhr.open('PUT', preSignedUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);

        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Failed to upload ${file.name}`);
            
            // Remove from uploading files
            setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
            
            // Clean up object URL
            URL.revokeObjectURL(objectUrl);
        }
    }, [value, onChange]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const currentTotal = value.length + uploadingFiles.length;
        const remainingSlots = maxFiles - currentTotal;
        
        if (remainingSlots <= 0) {
            toast.error(`Maximum ${maxFiles} images allowed`);
            return;
        }
        
        const filesToUpload = acceptedFiles.slice(0, remainingSlots);
        
        if (filesToUpload.length < acceptedFiles.length) {
            toast.warning(`Only uploading ${filesToUpload.length} files due to limit`);
        }
        
        filesToUpload.forEach(file => {
            uploadFile(file);
        });
    }, [uploadFile, value.length, uploadingFiles.length, maxFiles]);

    const onDropRejected = useCallback((rejectedFiles: any[]) => {
        if (rejectedFiles.length > 0) {
            const errors = rejectedFiles[0].errors;
            if (errors.some((e: any) => e.code === 'file-invalid-type')) {
                toast.error('Please upload valid image files (JPG/PNG)');
            } else if (errors.some((e: any) => e.code === 'file-too-large')) {
                toast.error('File is too large. Maximum size is 10MB');
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
        maxFiles: maxFiles - value.length - uploadingFiles.length,
        maxSize: 10 * 1024 * 1024, // 10MB
        disabled: disabled || (value.length + uploadingFiles.length) >= maxFiles,
        multiple: true,
    });

    const handleRemove = async (keyToRemove: string) => {
        try {
            const response = await fetch('/api/s3/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: keyToRemove })
            });

            if (response.ok) {
                const newValue = value.filter(key => key !== keyToRemove);
                onChange?.(newValue);
                toast.success('Image removed');
            } else {
                toast.error('Failed to remove image');
            }
        } catch (error) {
            console.error('Remove error:', error);
            toast.error('Failed to remove image');
        }
    };

    const getFileUrl = (key: string) => {
        return `https://registration.t3.storage.dev/${key}`;
    };

    const canUploadMore = (value.length + uploadingFiles.length) < maxFiles;
    const hasMinimumFiles = value.length >= minFiles;

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {canUploadMore && (
                <Card
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed cursor-pointer transition-colors",
                        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <CardContent className="p-4 sm:p-6">
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                            <div>
                                <p className="text-xs sm:text-sm font-medium">
                                    Drop images here or click to browse
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                    {value.length}/{maxFiles} images • Supports JPG, PNG (max 10MB each)
                                </p>
                                {!hasMinimumFiles && (
                                    <p className="text-[10px] sm:text-xs text-destructive mt-1">
                                        Minimum {minFiles} image{minFiles > 1 ? 's' : ''} required
                                    </p>
                                )}
                            </div>
                            <Button type="button" variant="outline" size="sm" className="text-xs sm:text-sm">
                                <CloudUploadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                Choose Images
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Uploading...</p>
                    {uploadingFiles.map((uploadingFile) => (
                        <Card key={uploadingFile.id}>
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden shrink-0">
                                        <Image
                                            src={uploadingFile.previewUrl}
                                            alt="Uploading..."
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium truncate">{uploadingFile.file.name}</p>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                                            {uploadingFile.progress}% complete
                                        </p>
                                        <Progress value={uploadingFile.progress} className="w-full mt-1" />
                                    </div>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-primary shrink-0" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Uploaded Images */}
            {value.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-medium">
                        Uploaded Images ({value.length}/{maxFiles})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
                        {value.map((key, index) => {
                            const fileUrl = getFileUrl(key);
                            return (
                                <Card key={key} className="relative group">
                                    <CardContent className="p-1 sm:p-2">
                                        <div className="relative aspect-square rounded overflow-hidden">
                                            <Image
                                                src={fileUrl}
                                                alt={`Uploaded image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                priority
                                            />
                                            
                                            {/* Overlay with actions */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1 sm:space-x-2">
                                                {/* Preview Button */}
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button type="button" variant="secondary" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
                                                            <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" side="top">
                                                        <div className="relative">
                                                            <Image
                                                                src={fileUrl}
                                                                alt="Image preview"
                                                                width={300}
                                                                height={200}
                                                                className="object-contain rounded-md max-w-[90vw] h-auto"
                                                                priority
                                                            />
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                
                                                {/* Remove Button */}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => handleRemove(key)}
                                                    className="h-6 w-6 sm:h-8 sm:w-8"
                                                >
                                                    <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty state when no images */}
            {value.length === 0 && uploadingFiles.length === 0 && !canUploadMore && (
                <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs sm:text-sm text-muted-foreground">No images uploaded</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}