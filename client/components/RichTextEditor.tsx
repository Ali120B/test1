import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'blockquote', 'code-block'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'blockquote', 'code-block'
];

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    return (
        <div className="bg-background rounded-lg border border-border overflow-hidden">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="text-foreground min-h-[200px]"
            />
            <style>{`
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--muted)/0.5);
        }
        .ql-container.ql-snow {
          border: none;
          font-family: inherit;
        }
        .ql-editor {
          min-h: 200px;
          font-size: 1rem;
        }
        .ql-snow .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .ql-snow .ql-fill {
          fill: hsl(var(--foreground));
        }
        .ql-snow .ql-picker {
          color: hsl(var(--foreground));
        }
        .ql-snow .ql-picker-options {
          background-color: hsl(var(--background));
          border-color: hsl(var(--border));
        }
      `}</style>
        </div>
    );
}
