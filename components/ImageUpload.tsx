"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface AnalysisResult {
  storeName: string | null;
  date: string | null;
  totalAmount: number | null;
  items: { name: string; amount: number }[];
  category: string;
  memo: string | null;
  imageUrl: string;
}

interface Props {
  onAnalyzed: (result: AnalysisResult) => void;
}

export default function ImageUpload({ onAnalyzed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setPreview(URL.createObjectURL(file));
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "解析に失敗しました");
        }

        onAnalyzed(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "解析中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    },
    [onAnalyzed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] },
    maxFiles: 1,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} capture="environment" />
        {loading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
            <p className="text-sm text-gray-500">AIが解析中...</p>
          </div>
        ) : preview ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="プレビュー"
              className="max-h-40 mx-auto rounded-lg object-contain"
            />
            <p className="text-xs text-gray-500">別の画像をドロップまたはタップ</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📸</div>
            <p className="text-gray-600 font-medium">
              レシート・請求書・食材の写真をアップロード
            </p>
            <p className="text-sm text-gray-400">
              ドラッグ&ドロップ、またはタップしてカメラ/ファイルを選択
            </p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </p>
      )}
    </div>
  );
}
