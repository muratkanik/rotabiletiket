'use client';

import dynamic from 'next/dynamic';

// Dynamically import react-quill-new to avoid SSR "document is not defined" issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface WysiwygEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function WysiwygEditor({ value, onChange, placeholder }: WysiwygEditorProps) {
    const modules = {
        toolbar: [
            [{ 'header': [2, 3, 4, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {/* @ts-ignore - react-quill-new types may not exactly match legacy */}
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
                className="prose-editor"
            />
        </div>
    );
}
