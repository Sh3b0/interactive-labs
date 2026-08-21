import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import {
    Bold,
    Code2,
    Heading1,
    Heading2,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListChecks,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    Table2,
    Underline as UnderlineIcon,
    Undo2,
    createIcons,
} from 'lucide';

const toolbarIcons = {
    Bold,
    Code2,
    Heading1,
    Heading2,
    Image: ImageIcon,
    Italic,
    Link: LinkIcon,
    List,
    ListChecks,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    Underline: UnderlineIcon,
    Undo2,
};

const lowlight = createLowlight(common);
const codeLanguages = [
    ['auto', 'Auto'],
    ['javascript', 'JavaScript'],
    ['typescript', 'TypeScript'],
    ['python', 'Python'],
    ['bash', 'Bash'],
    ['json', 'JSON'],
    ['html', 'HTML'],
    ['css', 'CSS'],
    ['sql', 'SQL'],
    ['yaml', 'YAML'],
    ['markdown', 'Markdown'],
];

function readImageFile(file, onLoad) {
    if (!file || !file.type.startsWith('image/')) return false;
    const reader = new FileReader();
    reader.addEventListener('load', () => onLoad(reader.result));
    reader.readAsDataURL(file);
    return true;
}

function getClipboardImage(dataTransfer) {
    const file = Array.from(dataTransfer?.files || []).find((item) => item.type.startsWith('image/'));
    if (file) return file;

    return Array.from(dataTransfer?.items || [])
        .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
        .map((item) => item.getAsFile())
        .find(Boolean);
}

function createToolbar(container, editor) {
    const toolbar = document.createElement('div');
    toolbar.className = 'tiptap-toolbar';

    const buttons = [
        ['Heading 1', 'Heading1', () => editor.chain().focus().toggleHeading({ level: 1 }).run()],
        ['Heading 2', 'Heading2', () => editor.chain().focus().toggleHeading({ level: 2 }).run()],
        ['Bold', 'Bold', () => editor.chain().focus().toggleBold().run()],
        ['Italic', 'Italic', () => editor.chain().focus().toggleItalic().run()],
        ['Underline', 'Underline', () => editor.chain().focus().toggleUnderline().run()],
        ['Bullet list', 'List', () => editor.chain().focus().toggleBulletList().run()],
        ['Ordered list', 'ListOrdered', () => editor.chain().focus().toggleOrderedList().run()],
        ['Task list', 'ListChecks', () => editor.chain().focus().toggleTaskList().run()],
        ['Quote', 'Quote', () => editor.chain().focus().toggleBlockquote().run()],
        ['Code', 'Code2', () => editor.chain().focus().toggleCodeBlock().run()],
        ['Horizontal rule', 'Minus', () => editor.chain().focus().setHorizontalRule().run()],
        ['Undo', 'Undo2', () => editor.chain().focus().undo()],
        ['Redo', 'Redo2', () => editor.chain().focus().redo()],
    ];

    buttons.forEach(([label, icon, action]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tiptap-toolbar-button';
        button.title = label;
        button.setAttribute('aria-label', label);
        button.innerHTML = `<i data-lucide="${icon}"></i>`;
        button.addEventListener('click', action);
        toolbar.appendChild(button);
    });

    const languageSelect = document.createElement('select');
    languageSelect.className = 'tiptap-toolbar-select';
    languageSelect.title = 'Code block language';
    codeLanguages.forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        languageSelect.appendChild(option);
    });
    languageSelect.addEventListener('change', () => {
        const language = languageSelect.value === 'auto' ? null : languageSelect.value;
        if (editor.isActive('codeBlock')) {
            editor.chain().focus().updateAttributes('codeBlock', { language }).run();
        } else {
            editor.chain().focus().setCodeBlock({ language }).run();
        }
    });
    toolbar.appendChild(languageSelect);

    const linkButton = document.createElement('button');
    linkButton.type = 'button';
    linkButton.className = 'tiptap-toolbar-button';
    linkButton.title = 'Add link';
    linkButton.setAttribute('aria-label', 'Add link');
    linkButton.innerHTML = '<i data-lucide="Link"></i>';
    linkButton.addEventListener('click', () => {
        const url = window.prompt('Enter a URL:');
        if (url) editor.chain().focus().setLink({ href: url }).run();
    });
    toolbar.appendChild(linkButton);

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.hidden = true;
    imageInput.addEventListener('change', () => {
        readImageFile(imageInput.files[0], (src) => {
            editor.chain().focus().setImage({ src, alt: 'Inserted image' }).run();
            imageInput.value = '';
        });
    });
    container.appendChild(imageInput);

    const imageButton = document.createElement('button');
    imageButton.type = 'button';
    imageButton.className = 'tiptap-toolbar-button';
    imageButton.title = 'Insert image';
    imageButton.setAttribute('aria-label', 'Insert image');
    imageButton.innerHTML = '<i data-lucide="Image"></i>';
    imageButton.addEventListener('click', () => imageInput.click());
    toolbar.appendChild(imageButton);

    container.prepend(toolbar);
    createIcons({ icons: toolbarIcons, attrs: { 'stroke-width': 1.8, 'aria-hidden': 'true' } });
}

// Initialize the editor when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('#editor');
    
    if (!container) {
        console.error('Editor container not found');
        return;
    }

    let markdown = '# Report Goes Here\n\nStart writing...';
    try {
        const response = await fetch('/README.md');
        if (response.ok) {
            markdown = await response.text();
        }
    } catch (error) {
        console.warn('Failed to load README.md, using default content.', error);
    }

    const editor = new Editor({
        element: container,
        extensions: [
            StarterKit.configure({ codeBlock: false, link: false, underline: false }),
            CodeBlockLowlight.configure({ lowlight }),
            Image.configure({ allowBase64: true }),
            Link.configure({ openOnClick: true, autolink: true }),
            Underline,
            TaskList,
            TaskItem.configure({ nested: true }),
            Markdown,
        ],
        content: '',
        autofocus: true,
        editorProps: {
            attributes: {
                class: 'tiptap-content',
                spellcheck: 'true',
            },
            handlePaste: (view, event) => {
                const image = getClipboardImage(event.clipboardData);
                return readImageFile(image, (src) => {
                    editor.chain().focus().setImage({ src, alt: 'Pasted image' }).run();
                });
            },
            handleDrop: (view, event) => {
                const image = getClipboardImage(event.dataTransfer);
                if (!image) return false;
                event.preventDefault();
                return readImageFile(image, (src) => {
                    editor.chain().focus().setImage({ src, alt: 'Dropped image' }).run();
                });
            },
        },
    });

    editor.commands.setContent(markdown, { contentType: 'markdown' });
    createToolbar(container.parentElement, editor);

    const saveContent = async (content) => {
        try {
            await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, filename: 'README.md' })
            });
            console.log('Auto-saved to README.md');
        } catch (err) {
            console.error('Auto-save failed:', err);
        }
    };

    let timeoutId;
    editor.on('update', () => {
        const markdown = editor.getMarkdown();
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => saveContent(markdown), 1000);
    });
});
