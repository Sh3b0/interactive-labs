import * as fs from "fs"
import * as path from "path"

const BASEDIR = path.dirname(path.dirname(path.dirname(__dirname)))

export let config = {
    log_format: process.env.LOG_FORMAT || "dev",
    server_port: parseInt(process.env.WORKSHOP_PORT || "10082"),
    workshop_dir: path.join(BASEDIR, "workshop"),
    content_dir: path.join(BASEDIR, "workshop/content"),
    restart_url: process.env.RESTART_URL,
    site_title: "Educates",

    // List of workshop modules. Can define "path" to page, without extension.
    // The page can either be Markdown (.md) or AsciiDoc (.adoc). Name of page
    // should be give by "title". Any document title in an AsciiDoc page will
    // be ignored. If no title is given it will be generated from name of
    // file. Label on the button to go to next page can be overridden by
    // "exit_sign".

    modules: [],
}

// Read all *.md files in content_dir and construct modules list [{path, title}]
export function load_md_modules(content_dir: string) {
    const md_files = fs.readdirSync(content_dir)
        .filter(f => f.endsWith('.md'))
        .sort();

    let modules = [];
    for (const file of md_files) {
        const file_path = path.join(content_dir, file);
        const content = fs.readFileSync(file_path, 'utf8');

        // Extract title from first h1 (# ...)
        let title = file.replace(/\.md$/, '');
        const h1Match = content.match(/^#\s+(.+)/m);
        if (h1Match) {
            title = h1Match[1].trim();
        }
        modules.push({
            path: file.replace(/\.md$/, ''),
            title: title
        });
    }
    return modules;
}


export function initialize_workshop() {
    config.modules = load_md_modules(config.content_dir)
}
