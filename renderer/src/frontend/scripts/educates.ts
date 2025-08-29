import * as path from "path"
import * as yaml from "js-yaml"
import * as $ from "jquery"
import "bootstrap"

// Hack to get jsonform working.

declare var window: any
window.$ = window.jQuery = $

import "underscore"
import "jsonform"

function set_paste_buffer_to_text(text) {
    let tmp = $("<textarea>").appendTo("body").val(text).select()
    document.execCommand("copy")
    tmp.remove()
}

function select_element_text(element) {
    let doc = window.document, selection, range
    if (window.getSelection && doc.createRange) {
        selection = window.getSelection()
        range = doc.createRange()
        range.selectNodeContents(element)
        selection.removeAllRanges()
        selection.addRange(range)
    } else if ((<any>doc.body).createTextRange) {
        range = (<any>doc.body).createTextRange()
        range.moveToElementText(element)
        range.select()
    }
}

interface Terminals {
    paste_to_terminal(text: string, id: string): void
    paste_to_all_terminals(text: string): void
    execute_in_terminal(command: string, id: string, clear: boolean): void
    execute_in_all_terminals(command: string, clear: boolean): void
    select_terminal(id: string): boolean
    clear_terminal(id: string): void
    clear_all_terminals(): void
    interrupt_terminal(id: string): void
    interrupt_all_terminals(): void
}

interface Dashboard {
    session_owner(): string
    expose_terminal(session: string): boolean
    expose_dashboard(name: string): boolean
    create_dashboard(name: string, url: string, focus: boolean): boolean
    delete_dashboard(name: string): boolean
    reload_dashboard(name: string, url: string, focus: boolean): boolean
    collapse_workshop(): void
    reload_workshop(): void
    finished_workshop(): void
    terminate_session(): void
    preview_image(src: string, title: string): void
}

function parent_terminals(): Terminals {
    if (parent && (<any>parent).educates)
        return (<any>parent).educates.terminals
}

function parent_dashboard(): Dashboard {
    if (parent && (<any>parent).educates)
        return (<any>parent).educates.dashboard
}

export function session_owner(): string {
    let dashboard = parent_dashboard()

    if (!dashboard)
        return undefined

    return dashboard.session_owner()
}

class Editor {
    readonly retries = 25
    readonly retry_delay = 1000

    private url: string = null

    constructor() {
        let $body = $("body")

        let session_namespace = $body.data('session-namespace')
        let ingress_domain = $body.data('ingress-domain')
        let ingress_protocol = $body.data('ingress-protocol')
        let ingress_port_suffix = $body.data('ingress-port-suffix')

        if (session_namespace && ingress_domain && ingress_protocol)
            this.url = `${ingress_protocol}://${session_namespace}.${ingress_domain}${ingress_port_suffix}/code-server`
    }

    private execute_call(endpoint, data, done, fail) {
        if (!this.url)
            return

        let retries = this.retries
        let retry_delay = this.retry_delay
        let url = this.url + endpoint

        function attempt_call() {
            $.ajax({
                type: 'POST',
                url: url,
                data: data,
                contentType: "application/json",
                dataType: "text"
            })
                .done(() => done())
                .fail((error) => {
                    if (error.status == 504) {
                        if (retries--)
                            setTimeout(attempt_call, retry_delay)
                        else
                            fail("Failed after retries")
                    }
                    else
                        fail("Unexpected HTTP error")
                })
        }

        attempt_call()
    }

    private fixup_path(file: string) {
        if (file.startsWith("~/"))
            file = file.replace("~/", "/home/eduk8s/")
        else if (file.startsWith("$HOME/"))
            file = file.replace("$HOME/", "/home/eduk8s/")
        else if (!file.startsWith("/"))
            file = path.join("/home/eduk8s", file)
        return file
    }

    open_file(file: string, line: number = 1, done, fail) {
        if (!this.url)
            return fail("Editor not available")

        if (!file)
            return fail("No file name provided")

        file = this.fixup_path(file)
        let data = JSON.stringify({ file, line })
        this.execute_call("/editor/line", data, done, fail)
    }

    select_matching_text(file: string, text: string, start: number, stop: number, isRegex: boolean, group: number, before: number, after: number, done, fail) {
        if (!this.url)
            return fail("Editor not available")

        if (!file)
            return fail("No file name provided")

        if (!text)
            return fail("No text to match provided")

        file = this.fixup_path(file)
        let data = JSON.stringify({ file, text, start, stop, isRegex, group, before, after })
        this.execute_call("/editor/select-matching-text", data, done, fail)
    }

    replace_text_selection(file: string, text: string, done, fail) {
        if (!this.url)
            return fail("Editor not available")

        if (!file)
            return fail("No file name provided")

        if (text === undefined)
            return fail("No replacement text provided")

        file = this.fixup_path(file)
        let data = JSON.stringify({ file, text })
        this.execute_call("/editor/replace-text-selection", data, done, fail)
    }

    append_lines_to_file(file: string, text: string, done, fail) {
        if (!this.url)
            return fail("Editor not available")

        if (!file)
            return fail("No file name provided")

        file = this.fixup_path(file)
        let data = JSON.stringify({ file, paste: text })
        this.execute_call("/editor/paste", data, done, fail)
    }

    insert_lines_before_line(file: string, line: number, text: string, done, fail) {
        if (!this.url)
            return fail("Editor not available")

        if (!file)
            return fail("No file name provided")

        file = this.fixup_path(file)
        let data = JSON.stringify({ file, line, paste: text })
        this.execute_call("/editor/paste", data, done, fail)
    }

    append_lines_after_match(file: string, match: string, text: string, done, fail) {
        if (!this.url)
            return fail("Editor not available")

        if (!file)
            return fail("No file name provided")

        if (!match)
            return fail("No string to match provided")

        file = this.fixup_path(file)
        let data = JSON.stringify({ file, prefix: match, paste: text })
        this.execute_call("/editor/paste", data, done, fail)
    }

    insert_value_into_yaml(file: string, path: string, value: any, done, fail) {
        if (!this.url)
            return fail("Editor not available")

        if (!file)
            return fail("No file name provided")

        if (!path)
            return fail("No property path provided")

        if (value === undefined)
            return fail("No property value provided")

        file = this.fixup_path(file)
        let data = JSON.stringify({ file, yamlPath: path, paste: yaml.dump(value) })
        this.execute_call("/editor/paste", data, done, fail)
    }

    execute_command(command: string, args: string[], done, fail) {
        if (!this.url)
            return fail("Editor not available")

        if (!command)
            return fail("No command provided")

        let data = JSON.stringify(args)
        this.execute_call("/command/" + encodeURIComponent(command), data, done, fail)
    }
}

export let editor: Editor

export function interrupt_terminal(id: string, done = () => { }, fail = (_) => { }) {
    let terminals = parent_terminals()

    if (!terminals)
        return fail("Terminals are not available")

    id = id || "1"

    if (id == "*") {
        expose_dashboard("terminal")
        terminals.interrupt_all_terminals()
    }
    else {
        expose_terminal(id)
        terminals.interrupt_terminal(id)
    }

    done()
}

export function interrupt_all_terminals(done = () => { }, fail = (_) => { }) {
    let terminals = parent_terminals()

    if (!terminals)
        return fail("Terminals are not available")

    expose_dashboard("terminal")

    terminals.interrupt_all_terminals()

    done()
}

export function clear_terminal(id: string, done = () => { }, fail = (_) => { }) {
    let terminals = parent_terminals()

    if (!terminals)
        return fail("Terminals are not available")

    id = id || "1"

    if (id == "*") {
        expose_dashboard("terminal")
        terminals.clear_all_terminals()
    }
    else {
        expose_terminal(id)
        terminals.clear_terminal(id)
    }

    done()
}

export function clear_all_terminals(done = () => { }, fail = (_) => { }) {
    let terminals = parent_terminals()

    if (!terminals)
        return fail("Terminals are not available")

    expose_dashboard("terminal")

    terminals.clear_all_terminals()

    done()
}

export function paste_to_terminal(text: string, id: string, done = () => { }, fail = (_) => { }) {
    let terminals = parent_terminals()

    if (!terminals)
        return fail("Terminals are not available")

    id = id || "1"

    if (id == "*") {
        expose_dashboard("terminal")
        terminals.paste_to_all_terminals(text)
    }
    else {
        expose_terminal(id)
        terminals.paste_to_terminal(text, id)
    }

    done()
}

export function execute_in_terminal(command: string, id: string, clear: boolean = false, done = () => { }, fail = (_) => { }) {
    let terminals = parent_terminals()

    if (!terminals)
        return fail("Terminals are not available")

    id = id || "1"

    if (id == "*") {
        expose_dashboard("terminal")
        terminals.execute_in_all_terminals(command, clear)
    }
    else {
        expose_terminal(id)
        terminals.execute_in_terminal(command, id, clear)
    }

    done()
}

export function execute_in_all_terminals(command: string, clear: boolean = false, done = () => { }, fail = (_) => { }) {
    let terminals = parent_terminals()

    if (!terminals)
        return fail("Terminals are not available")

    expose_dashboard("terminal")

    terminals.execute_in_all_terminals(command, clear)

    done()
}

export function expose_terminal(session: string, done = () => { }, fail = (_) => { }) {
    let dashboard = parent_dashboard()

    if (!dashboard)
        return fail("Dashboard is not available")

    if (!dashboard.expose_terminal(session))
        return fail("Terminal does not exist")

    let terminals = parent_terminals()

    if (!terminals)
        return fail("Terminals are not available")

    terminals.select_terminal(session)

    done()
}

export function expose_dashboard(name: string, done = () => { }, fail = (_) => { }) {
    let dashboard = parent_dashboard()

    if (!dashboard)
        return fail("Dashboard is not available")

    if (!dashboard.expose_dashboard(name))
        return fail("Dashboard does not exist")

    done()
}

export function create_dashboard(name: string, url: string, focus, done = () => { }, fail = (_) => { }) {
    let dashboard = parent_dashboard()

    if (!dashboard)
        return fail("Dashboard is not available")

    if (!dashboard.create_dashboard(name, url, focus))
        return fail("Dashboard already exists")

    done()
}

export function delete_dashboard(name: string, done = () => { }, fail = (_) => { }) {
    let dashboard = parent_dashboard()

    if (!dashboard)
        return fail("Dashboard is not available")

    if (!dashboard.delete_dashboard(name))
        return fail("Dashboard does not exist")

    done()
}

export function reload_dashboard(name: string, url: string, focus: boolean = true, done = () => { }, fail = (_) => { }) {
    let dashboard = parent_dashboard()

    if (!dashboard) {
        fail("Dashboard is not available")
        return
    }

    if (!dashboard.reload_dashboard(name, url, focus))
        return fail("Dashboard does not exist")

    done()
}

export function collapse_workshop(done = () => { }, fail = (_) => { }) {
    let dashboard = parent_dashboard()

    if (!dashboard)
        return fail("Dashboard is not available")

    dashboard.collapse_workshop()

    done()
}

export function reload_workshop(done = () => { }, fail = (_) => { }) {
    let dashboard = parent_dashboard()

    if (!dashboard)
        return fail("Dashboard is not available")

    dashboard.reload_workshop()

    done()
}

export function finished_workshop() {
    let dashboard = parent_dashboard()

    if (dashboard)
        dashboard.finished_workshop()
}

export function terminate_session() {
    let dashboard = parent_dashboard()

    if (dashboard)
        dashboard.terminate_session()
}

export function preview_image(src: string, title: string) {
    let dashboard = parent_dashboard()

    if (!dashboard) {
        $("#preview-image-element").attr("src", src)
        $("#preview-image-title").text(title)
        $("#preview-image-dialog").modal("show")
    }
    else
        dashboard.preview_image(src, title)
}

function execute_examiner_test(name, url, args, form, timeout, retries, delay, cascade, done, fail) {
    if (!name)
        return fail("Test name not provided")

    let data = JSON.stringify({ args, form, timeout })

    if (!url) {
        url = `/examiner/test/${name}`
    }

    function attempt_call() {
        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            contentType: "application/json",
            dataType: "json"
        })
            .done((result) => {
                if (!result["success"]) {
                    if (retries--)
                        setTimeout(attempt_call, delay * 1000)
                    else
                        fail(result["message"] || "Invalid response")
                }
                else {
                    done()
                }
            })
            .fail((error) => {
                fail("Unexpected HTTP error")
            })
    }

    attempt_call()
}

export function register_action(options: any) {
    let defaults = {
        name: undefined,
        glyph: "fa-bug",
        args: undefined,
        title: "Action: Invalid action definition",
        body: undefined,
        handler: (args, element, done, fail) => { fail("Invalid action definition") },
        waiting: undefined,
        spinner: false,
        success: undefined,
        failure: undefined,
        setup: (args, element) => { },
        trigger: (args, element) => { },
        finish: (args, element, error) => { },
        pause: 750,
        cooldown: 1,
    }

    options = { ...defaults, ...options }

    let name: string = options["name"]
    let glyph: string = options["glyph"]
    let args: any = options["args"]
    let title: any = options["title"]
    let body: any = options["body"]
    let handler: any = options["handler"]
    let waiting: string = options["waiting"]
    let spinner: boolean = options["spinner"]
    let success: string = options["success"]
    let failure: string = options["failure"]
    let setup: any = options["setup"]
    let trigger: any = options["trigger"]
    let finish: any = options["finish"]
    let pause: any = options["pause"]
    let cooldown: number = options["cooldown"]

    if (name === undefined)
        return

    let classname = name.replace(":", "\\:")

    let selectors = []

    let $body = $("body")

    let generator = $('meta[name=generator]').attr('content')

    if (generator.startsWith("Educates (asciidoc)"))
        selectors = [`.${classname} .content code`]
    else if (generator.startsWith("Educates (markdown)") || generator.startsWith("Educates (hugo)"))
        selectors = [`code.language-${classname}`]
    else if (generator.startsWith("Docutils "))
        selectors = [`div.highlight-${classname}>div.highlight`]

    let index = 1

    for (let selector of selectors) {
        $(selector).each((_, element) => {
            let code_element = $(element)
            let parent_element = code_element.parent()

            code_element.addClass("magic-code-block")
            parent_element.addClass("magic-code-block-parent")

            if (generator.startsWith("Educates (asciidoc)")) {
                let root_element = parent_element.parent().parent()

                root_element.addClass("magic-code-block-root")
                root_element.attr("data-action-name", name)
            }

            // Must be set as attr() and not data() so we can use a selector
            // in jquery based on data attribute later on. This is because
            // data() doesn't store it on the HTML element but separate.

            parent_element.attr("data-action-name", name)

            let action_args: any = code_element.text()

            if (args === "json") {
                action_args = JSON.parse(action_args.trim() || "{}")
            }
            else if (args === "yaml") {
                action_args = yaml.load(action_args.trim() || "{}")
            }
            else if (typeof args === "function") {
                action_args = args(action_args)
            }

            let title_string = title

            if (typeof title === "function")
                title_string = title(action_args)

            let title_element = $("<div class='magic-code-block-title'></div>").text(title_string)
            let glyph_element = $(`<span class='magic-code-block-glyph fas ${glyph}' aria-hidden='true'></span>`)

            parent_element.before(title_element)
            title_element.prepend(glyph_element)

            title_element.attr("data-action-name", name)
            title_element.attr("data-action-index", `${index}`)

            index++

            let body_string = body

            if (typeof body === "function")
                body_string = body(action_args)

            $.each([title_element, parent_element], (_, target) => {
                target.on("click", async (event) => {
                    if (!event.shiftKey) {
                        console.log(`[${title_string}] Execute:`, action_args)

                        let triggered = $(title_element).data("action-triggered")
                        let completed = $(title_element).data("action-completed")

                        let now = new Date().getTime()

                        let cooldown_period = cooldown

                        if (action_args.cooldown !== undefined)
                            cooldown_period = action_args.cooldown

                        if (cooldown_period) {
                            if (triggered && !completed) {
                                console.log(`[${title_string}] Cooldown: Executing`)

                                return
                            }

                            if (completed) {
                                if (((now - completed) / 1000) < cooldown_period) {
                                    console.log(`[${title_string}] Cooldown: Interval`)
                                    return
                                }
                            }
                        }

                        $(title_element).data("action-triggered", now)
                        $(title_element).data("action-completed", undefined)

                        if (success)
                            title_element.removeClass(`${success}`)
                        if (failure)
                            title_element.removeClass(`${failure}`)

                        if (waiting) {
                            glyph_element.removeClass(`${glyph}`)
                            glyph_element.addClass(`${waiting}`)
                            if (spinner)
                                glyph_element.addClass("fa-spin")
                        }

                        trigger(action_args, parent_element)

                        $(title_element).attr("data-action-result", "pending")

                        handler(action_args, parent_element, () => {
                            console.log(`[${title_string}] Success`)

                            let now = new Date().getTime()

                            $(title_element).attr("data-action-result", "success")
                            $(title_element).data("action-completed", now)

                            if (success)
                                title_element.addClass(`${success}`)
                            if (failure)
                                title_element.removeClass(`${failure}`)

                            glyph_element.removeClass(`${glyph}`)

                            if (waiting) {
                                glyph_element.removeClass(`${waiting}`)
                                glyph_element.removeClass("fa-spin")
                            }

                            glyph_element.addClass("fa-check-circle")

                            finish(action_args, parent_element)

                            if (action_args.cascade) {
                                setTimeout(() => {
                                    if (generator.startsWith("Educates (asciidoc)")) {
                                        let root_element = parent_element.parent().parent()
                                        root_element.nextAll(`*[data-action-name]`).first().children("div.content").children("div.magic-code-block-title").trigger("click")
                                    }
                                    else {
                                        parent_element.nextAll(`*[data-action-name]`).first().trigger("click")
                                    }
                                }, action_args.pause || pause)
                            }
                        }, (error) => {
                            console.log(`[${title_string}] Failure: ${error}`)

                            let now = new Date().getTime()

                            $(title_element).attr("data-action-result", "failure")
                            $(title_element).data("action-completed", now)

                            if (failure)
                                title_element.addClass(`${failure}`)
                            if (success)
                                title_element.removeClass(`${success}`)

                            glyph_element.addClass(`${glyph}`)

                            if (waiting) {
                                glyph_element.removeClass(`${waiting}`)
                                glyph_element.removeClass("fa-spin")
                            }

                            finish(action_args, parent_element, error)
                        })
                    }
                    else {
                        event.preventDefault()
                        event.stopPropagation()

                        if (typeof body_string === "function") {
                            // Call the function providing a callback to set the
                            // value. This allows the function to set the text
                            // of the code element by calling the setter
                            // function.

                            body_string(text => set_paste_buffer_to_text(text))
                        }
                        else {
                            set_paste_buffer_to_text(body_string)
                        }
                    }

                    window.getSelection().removeAllRanges()
                })
            })

            setup(action_args, parent_element)

            if (action_args.autostart)
                parent_element.attr("data-action-autostart", "true")

            if (action_args.hidden) {
                title_element.attr("data-action-hidden", "true")
                parent_element.attr("data-action-hidden", "true")

                title_element.hide()
                parent_element.hide()
            }
        })
    }
}

$(document).ready(async () => {
    editor = new Editor()

    let $body = $("body")

    let generator = $('meta[name=generator]').attr('content')

    // Ensure clicking on links in content always opens them in a new page
    // if they are for an external site.

    $("section.page-content a").each((_, element) => {
        let anchor = <HTMLAnchorElement>element
        if (!(location.hostname === anchor.hostname || !anchor.hostname.length)) {
            $(anchor).attr("target", "_blank")
        }
    })

    // When click on embedded image in content, open it up in image preview
    // dialog so can get a larger view of the image.

    $("section.page-content img").each((_, element) => {
        let image = <HTMLImageElement>element
        $(element).on("click", () => {
            preview_image(image.src, image.alt)
        })
    })

    // When click on special inline copy action, copy contents of preceding
    // code element into the copy paste buffer.

    $(".inline-copy").each((_, element) => {
        let glyph = $(element)
        let target = glyph.prev("code")
        if (target.length) {
            target.on("click", () => {
                set_paste_buffer_to_text(target.text())
                glyph.addClass("fas")
                glyph.removeClass("far")
                setTimeout(() => {
                    glyph.addClass("far")
                    glyph.removeClass("fas")
                }, 250)
            })
        }
    })

    // Register handlers for terminal actions.

    // register_action({
    //     name: "bash",
    //     glyph: "fa-running",
    //     args: "text",
    //     title: (args) => {
    //         return `Command: Click to run`
    //     },
    //     body: (args) => {
    //         return args
    //     },
    //     handler: (args, element, done, fail) => {
    //         execute_in_terminal(args.trim(), "1", args.clear, done, fail)
    //     }
    // })

    register_action({
        name: "terminal:execute",
        glyph: "fa-running",
        args: "yaml",
        title: (args) => {
            let session = args.session || "1"
            let prefix = args.prefix || "Command"
            let subject = args.title || `Click to execute in highlighted terminal`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return args.command
        },
        handler: (args, element, done, fail) => {
            execute_in_terminal(args.command, args.session || "1", args.clear, done, fail)
        }
    })

    register_action({
        name: "terminal:clear",
        glyph: "fa-running",
        args: "yaml",
        title: (args) => {
            let session = args.session || "1"
            let prefix = args.prefix || "Terminal"
            let subject = args.title || `Clear terminal "${session}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return ""
        },
        handler: (args, element, done, fail) => {
            clear_terminal(args.session || "1", done, fail)
        }
    })

    register_action({
        name: "terminal:interrupt",
        glyph: "fa-running",
        args: "yaml",
        title: (args) => {
            let session = args.session || "1"
            let prefix = args.prefix || "Terminal"
            let subject = args.title || `Interrupt command in terminal "${session}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return "<ctrl+c>"
        },
        handler: (args, element, done, fail) => {
            interrupt_terminal(args.session || "1", done, fail)
        }
    })

    register_action({
        name: "terminal:input",
        glyph: "fa-running",
        args: "yaml",
        title: (args) => {
            let session = args.session || "1"
            let prefix = args.prefix || "Terminal"
            let subject
            if (args.endl === undefined || args.endl === true)
                subject = args.title || `Input text with newline into terminal "${session}"`
            else
                subject = args.title || `Input text into terminal "${session}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return args.text
        },
        handler: (args, element, done, fail) => {
            let text = args.text
            if (args.endl === undefined || args.endl === true)
                text = text + "\r"
            paste_to_terminal(text, args.session || "1", done, fail)
        }
    })

    // Register handlers for copy actions.
    const hljsLanguages = [
        'python', 'javascript', 'java', 'c', 'cpp', 'csharp', 'bash', 'go', 'ruby', 'php',
        'swift', 'kotlin', 'typescript', 'html', 'css', 'sql',
        'rust', 'dart', 'r', 'matlab', 'scala', 'perl', 'lua', 'haskell', 'elixir',
        'clojure', 'groovy', 'powershell', 'json', 'yaml', 'xml', 'markdown',
        'dockerfile', 'makefile', 'nginx', 'apache', 'vim', 'diff', 'ini', 'toml',
        'arduino', 'assembly', 'basic', 'coffeescript', 'd',
        'erlang', 'fortran', 'julia', 'objectivec', 'pascal', 'prolog', 'sass',
        'scss', 'smalltalk', 'stylus', 'tex', 'vbnet', 'verilog', 'vhdl'
    ];

    hljsLanguages.forEach(language => {
        register_action({
            name: language,
            glyph: "fa-copy",
            args: "text",
            title: (args) => {
                return `${language.charAt(0).toUpperCase() + language.slice(1)}: Click to copy`;
            },
            body: (args) => {
                return args;
            },
            handler: (args, element, done, fail) => {
                set_paste_buffer_to_text(args.trim());
                done();
            },
            cooldown: 0
        });
    });

    register_action({
        name: "shell",
        glyph: "fa-user-edit",
        args: "text",
        title: (args) => {
            let prefix = "Command"
            let subject = "Click to copy; Change values before use"
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            return args
        },
        handler: (args, element, done, fail) => {
            set_paste_buffer_to_text(args.trim())
            done()
        },
        cooldown: 0
    })

    // Register handlers for dashboard and URL actions.

    register_action({
        name: "dashboard:expose-dashboard",
        glyph: "fa-play",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Dashboard"
            let subject = args.title || `Expose dashboard "${args.name}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return ""
        },
        handler: (args, element, done, fail) => {
            expose_dashboard(args.name, done, fail)
        }
    })

    register_action({
        name: "dashboard:open-dashboard",
        glyph: "fa-eye",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Dashboard"
            let subject = args.title || `Open dashboard "${args.name}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return ""
        },
        handler: (args, element, done, fail) => {
            expose_dashboard(args.name, done, fail)
        }
    })

    register_action({
        name: "dashboard:create-dashboard",
        glyph: "fa-plus-circle",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Dashboard"
            let subject = args.title || `Create dashboard "${args.name}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return args.url
        },
        handler: (args, element, done, fail) => {
            let focus = true
            if (args.focus !== undefined)
                focus = args.focus
            create_dashboard(args.name, args.url, args.focus, done, fail)
        }
    })

    register_action({
        name: "dashboard:delete-dashboard",
        glyph: "fa-trash-alt",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Dashboard"
            let subject = args.title || `Delete dashboard "${args.name}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return ""
        },
        handler: (args, element, done, fail) => {
            delete_dashboard(args.name, done, fail)
        }
    })

    register_action({
        name: "dashboard:reload-dashboard",
        glyph: "fa-sync-alt",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Dashboard"
            let subject = args.title || `Reload dashboard "${args.name}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return args.url
        },
        handler: (args, element, done, fail) => {
            let focus = true
            if (args.focus !== undefined)
                focus = args.focus
            reload_dashboard(args.name, args.url, focus, done, fail)
        }
    })

    register_action({
        name: "dashboard:open-url",
        glyph: "fa-external-link-alt",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Dashboard"
            let subject = args.title || "Open URL in browser"
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return args.url
        },
        handler: (args, element, done, fail) => {
            window.open(args.url, "_blank")
            done()
        },
        cooldown: 3
    })

    // Register handlers for code editor actions.

    register_action({
        name: "editor:open-file",
        glyph: "fa-edit",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Editor"
            let subject = args.title
            if (!args.title) {
                if (args.line)
                    subject = `Open file "${args.file}" at line ${args.line}`
                else
                    subject = `Open file "${args.file}"`
            }
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return ""
        },
        handler: (args, element, done, fail) => {
            expose_dashboard("editor")
            editor.open_file(args.file, args.line || 1, done, fail)
        },
        waiting: "fa-cog",
        spinner: true,
        cooldown: 3
    })

    register_action({
        name: "editor:select-matching-text",
        glyph: "fa-search",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Editor"
            let subject
            if (args.isRegex) {
                if (args.group)
                    subject = args.title || `Match pattern group ${args.group} in file "${args.file}"`
                else
                    subject = args.title || `Match pattern in file "${args.file}"`
            }
            else
                subject = args.title || `Select text in file "${args.file}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return args.text
        },
        handler: (args, element, done, fail) => {
            expose_dashboard("editor")
            editor.select_matching_text(args.file, args.text, args.start, args.stop, args.isRegex, args.group, args.before, args.after, done, fail)
        },
        waiting: "fa-cog",
        spinner: true,
        cooldown: 3
    })

    register_action({
        name: "editor:replace-text-selection",
        glyph: "fa-pencil-alt",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Editor"
            let subject = args.title || `Replace text selection in file "${args.file}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return args.text
        },
        handler: (args, element, done, fail) => {
            expose_dashboard("editor")
            editor.replace_text_selection(args.file, args.text, done, fail)
        },
        waiting: "fa-cog",
        spinner: true,
        cooldown: 3
    })

    register_action({
        name: "editor:append-lines-to-file",
        glyph: "fa-file-import",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Editor"
            let subject = args.title || `Append lines to file "${args.file}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return args.text
        },
        handler: (args, element, done, fail) => {
            expose_dashboard("editor")
            editor.append_lines_to_file(args.file, args.text || "", done, fail)
        },
        waiting: "fa-cog",
        spinner: true,
        cooldown: 3
    })

    register_action({
        name: "editor:insert-lines-before-line",
        glyph: "fa-file-import",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Editor"
            let subject = args.title || `Insert lines before line ${args.line} in file "${args.file}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return args.text
        },
        handler: (args, element, done, fail) => {
            expose_dashboard("editor")
            editor.insert_lines_before_line(args.file, args.line || "", args.text || "", done, fail)
        },
        waiting: "fa-cog",
        spinner: true,
        cooldown: 3
    })

    register_action({
        name: "editor:append-lines-after-match",
        glyph: "fa-file-import",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Editor"
            let subject = args.title || `Append lines after "${args.match}" in file "${args.file}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return args.text
        },
        handler: (args, element, done, fail) => {
            expose_dashboard("editor")
            editor.append_lines_after_match(args.file, args.match || "", args.text || "", done, fail)
        },
        waiting: "fa-cog",
        spinner: true,
        cooldown: 3
    })

    register_action({
        name: "editor:insert-value-into-yaml",
        glyph: "fa-file-import",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Editor"
            let subject = args.title || `Insert value into YAML file "${args.file}" at "${args.path}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return yaml.dump(args.value)
        },
        handler: (args, element, done, fail) => {
            expose_dashboard("editor")
            editor.insert_value_into_yaml(args.file, args.path, args.value, done, fail)
        },
        waiting: "fa-cog",
        spinner: true,
        cooldown: 3
    })

    register_action({
        name: "editor:execute-command",
        glyph: "fa-play",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Editor"
            let subject = args.title || `Execute command "${args.command}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            if (!args.args)
                return ""
            return yaml.dump(args.args)
        },
        handler: (args, element, done, fail) => {
            expose_dashboard("editor")
            editor.execute_command(args.command, args.args || [], done, fail)
        },
        waiting: "fa-cog",
        spinner: true,
        cooldown: 3
    })

    // Register handlers for examiner actions.

    register_action({
        name: "examiner:execute-test",
        glyph: "fa-tasks",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Examiner"
            let subject = args.title || `Execute test case "${args.name}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return ""
        },
        handler: (args, element, done, fail) => {
            let form_values = {}
            let form_parent = element.prev("div.magic-code-block-form")
            if (form_parent.length) {
                let form_object = form_parent.find(">form")[0]
                let form_data = new FormData(form_object)
                let object = {}
                form_data.forEach((value, key) => {
                    if (!Reflect.has(object, key)) {
                        object[key] = value
                        return
                    }
                    if (!Array.isArray(object[key])) {
                        object[key] = [object[key]]
                    }
                    object[key].push(value);
                })
                form_values = object
            }
            execute_examiner_test(
                args.name,
                args.url || "",
                args.args || [],
                form_values,
                args.timeout || 15,
                args.retries || 0,
                args.delay || 1,
                args.cascade || false,
                done,
                fail)
        },
        waiting: "fa-cog",
        spinner: true,
        setup: (args, element) => {
            if (args.inputs && args.inputs.schema) {
                let parent_element = element
                let title_element = parent_element.prev()
                let form_element = $("<form></form>")
                let form_options = {
                    ...args.inputs,
                    onSubmit: (errors, values) => {
                        if (!errors) {
                            title_element.trigger("click")
                        }
                    }
                }
                form_element.jsonForm(form_options)
                let div_element = $("<div class='magic-code-block-form'></div>")
                div_element.prepend(form_element)
                form_element.on("keydown", ":input:not(textarea)", function (event) {
                    if (event.key == "Enter") {
                        event.preventDefault()
                    }
                })
                element.before(div_element)
                element.hide()
                title_element.css("pointer-events", "none")
            }
            // if (args.autostart)
            //     element.attr("data-examiner-autostart", "true")
        },
    })

    // Register handler for file download and upload actions.

    register_action({
        name: "files:download-file",
        glyph: "fa-download",
        args: "yaml",
        title: (args) => {
            let file = args.path
            if (args.url) {
                file = args.url
            }
            let prefix = args.prefix || "Files"
            let subject = args.title || `Download file "${args.download || file}"`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined) {
                return args.description
            }
            else if (args.preview) {
                let url = `/files/${args.path}`
                if (args.url) {
                    url = args.url
                }
                return setter => {
                    fetch(url)
                        .then(response => { return response.text() })
                        .then(text => { setter(text) })
                        .catch(error => console.log(error))
                }
            }
            return ""
        },
        handler: (args, element, done, fail) => {
            if (args.url) {
                fetch(args.url)
                    .then(response => {
                        return response.text()
                    })
                    .then(text => {
                        let url = new URL(args.url)
                        let basename = path.basename(url.pathname) || url.hostname || "download.txt"
                        let download = document.createElement("a")
                        let blob = new Blob([text], { type: "octet/stream" })
                        download.setAttribute("href", window.URL.createObjectURL(blob))
                        download.setAttribute("download", args.download || basename)
                        download.style.display = "none"
                        document.body.appendChild(download)
                        download.click()
                        document.body.removeChild(download)
                        done()
                    })
                    .catch(error => {
                        console.log(error)
                        fail()
                    })
            }
            else {
                let pathname = `/files/${args.path}`
                let basename = path.basename(pathname)
                let download = document.createElement("a")
                download.setAttribute("href", pathname)
                download.setAttribute("download", args.download || basename)
                download.style.display = "none"
                document.body.appendChild(download)
                download.click()
                document.body.removeChild(download)
                done()
            }
        }
    })

    register_action({
        name: "files:copy-file",
        glyph: "fa-copy",
        args: "yaml",
        title: (args) => {
            let file = args.path
            if (args.url) {
                file = args.url
            }
            let prefix = args.prefix || "Files"
            let subject = args.title || `Copy file "${args.download || file}" to paste buffer`
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined) {
                return args.description
            }
            else if (args.preview) {
                let url = `/files/${args.path}`
                if (args.url) {
                    url = args.url
                }
                return setter => {
                    fetch(url)
                        .then(response => { return response.text() })
                        .then(text => { setter(text) })
                        .catch(error => console.log(error))
                }
            }
            return ""
        },
        handler: (args, element, done, fail) => {
            let url = `/files/${args.path}`
            if (args.url) {
                url = args.url
            }
            fetch(url)
                .then(response => {
                    return response.text()
                })
                .then(text => {
                    set_paste_buffer_to_text(text)
                    done()
                })
                .catch(error => {
                    console.log(error)
                    fail()
                })
        },
    })

    register_action({
        name: "files:upload-file",
        glyph: "fa-upload",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Files"
            let subject = args.title || `Upload file as "${args.upload || args.path}"`
            return `${prefix}: ${subject}`
        },
        setup: (args, element) => {
            let parent_element = element
            let title_element = parent_element.prev()
            let form_element = $(`<form><div class="form-group"><input type="hidden" name="path" value="${args.path || ''}"><input type="file" class="form-control-file" name="file" id="file" required></div><div class="form-group my-2"><input type="submit" class="btn btn-primary" id="form-action-submit" value="Upload"></div></form>`)
            let div_element = $("<div class='magic-code-block-upload'></div>")
            div_element.prepend(form_element)
            form_element.on("keydown", ":input:not(textarea)", function (event) {
                if (event.key == "Enter") {
                    event.preventDefault()
                }
            })
            element.before(div_element)
            element.hide()
            title_element.css("pointer-events", "none")
            form_element.find("#form-action-submit").on("click", (event) => {
                let form_object = form_element[0] as HTMLFormElement
                if (!form_object.checkValidity()) {
                    form_object.reportValidity()
                    event.preventDefault()
                }
                else {
                    title_element.trigger("click")
                    event.preventDefault()
                }
            })
        },
        body: (args) => {
            return args.description || ""
        },
        handler: (args, element, done, fail) => {
            let form_parent = element.prev("div.magic-code-block-upload")
            if (form_parent.length) {
                let form_data = new FormData(form_parent.find(">form")[0])
                fetch("/upload/file", {
                    method: 'POST',
                    body: form_data,
                })
                    .then(async (res) => {
                        if (res.status == 200) {
                            let data = await res.text()
                            if (data != "OK") {
                                fail()
                            }
                            else {
                                done()
                            }
                        }
                        else {
                            fail()
                        }
                    })
                    .catch((err) => {
                        fail()
                    })
            }
        },
        waiting: "fa-cog",
        spinner: true,
        cooldown: 3,
    })

    register_action({
        name: "files:upload-files",
        glyph: "fa-upload",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Files"
            let subject = ""
            if (!args.directory && args.directory != ".") {
                subject = args.title || "Upload files"
            }
            else {
                subject = args.title || `Upload files to "${args.directory}"`
            }

            return `${prefix}: ${subject}`
        },
        setup: (args, element) => {
            let parent_element = element
            let title_element = parent_element.prev()
            let form_element = $(`<form><div class="form-group"><input type="hidden" name="directory" value="${args.directory || ''}"><input type="file" class="form-control-file" name="files" id="files" multiple required></div><div class="form-group my-2"><input type="submit" class="btn btn-primary" id="form-action-submit" value="Upload"></div></form>`)
            let div_element = $("<div class='magic-code-block-upload'></div>")
            div_element.prepend(form_element)
            form_element.on("keydown", ":input:not(textarea)", function (event) {
                if (event.key == "Enter") {
                    event.preventDefault()
                }
            })
            element.before(div_element)
            element.hide()
            title_element.css("pointer-events", "none")
            form_element.find("#form-action-submit").on("click", (event) => {
                let form_object = form_element[0] as HTMLFormElement
                if (!form_object.checkValidity()) {
                    form_object.reportValidity()
                    event.preventDefault()
                }
                else {
                    title_element.trigger("click")
                    event.preventDefault()
                }
            })
        },
        body: (args) => {
            return args.description || ""
        },
        handler: (args, element, done, fail) => {
            let form_parent = element.prev("div.magic-code-block-upload")
            if (form_parent.length) {
                let form_data = new FormData(form_parent.find(">form")[0])
                fetch("/upload/files", {
                    method: 'POST',
                    body: form_data,
                })
                    .then(async (res) => {
                        if (res.status == 200) {
                            let data = await res.text()
                            if (data != "OK") {
                                fail()
                            }
                            else {
                                done()
                            }
                        }
                        else {
                            fail()
                        }
                    })
                    .catch((err) => {
                        fail()
                    })
            }
        },
        waiting: "fa-cog",
        spinner: true,
        cooldown: 3,
    })

    // Register handlers for section actions. These need to be done last.

    register_action({
        name: "section:heading",
        glyph: "fa-info-circle",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Section"
            let subject = args.title || "Instructions"
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return ""
        },
        handler: (args, element, done, fail) => {
            done()
        },
    })

    register_action({
        name: "section:begin",
        glyph: "fa-chevron-down",
        args: "yaml",
        title: (args) => {
            let prefix = args.prefix || "Section"
            let subject = args.title || "Instructions"
            return `${prefix}: ${subject}`
        },
        body: (args) => {
            if (args.description !== undefined)
                return args.description
            return ""
        },
        handler: (args, element, done, fail) => {
            done()
        },
        trigger: (args, element) => {
            let parent_element = element
            let name = args.name || "*"
            if (generator.startsWith("Educates (asciidoc)")) {
                let root_element = parent_element.parent().parent()
                let state_element = root_element
                if (state_element.attr("data-section-state") == "visible") {
                    let element_range = root_element.nextUntil(`.magic-code-block-root[data-action-name='section:end'][data-section-name='${name}']`)
                    element_range.hide()
                    $.each(element_range.filter("[data-section-state='visible']"), (_, target) => {
                        let section = $(target)
                        let glyph = section.find(".magic-code-block-glyph")
                        section.attr("data-section-state", "hidden")
                        glyph.addClass("fa-chevron-down")
                        glyph.removeClass("fa-chevron-up")
                        glyph.removeClass("fa-check-circle")
                    })
                    state_element.attr("data-section-state", "hidden")
                }
                else {
                    let element_range = root_element.nextUntil(`.magic-code-block-root[data-action-name='section:end'][data-section-name='${name}']`).filter(`[data-content-name='${name}']`)
                    element_range.not("[data-action-hidden='true']").show()
                    state_element.attr("data-section-state", "visible")
                    element_range.filter("[data-action-name][data-action-autostart]").trigger("click")
                }
            }
            else {
                let title_element = parent_element.prev()
                let state_element = title_element
                if (state_element.attr("data-section-state") == "visible") {
                    let element_range = parent_element.nextUntil(`.magic-code-block-parent[data-action-name='section:end'][data-section-name='${name}']`)
                    element_range.hide()
                    $.each(element_range.filter("[data-section-state='visible']"), (_, target) => {
                        let section_element = $(target)
                        let glyph_element = section_element.children(".magic-code-block-glyph")
                        section_element.attr("data-section-state", "hidden")
                        glyph_element.addClass("fa-chevron-down")
                        glyph_element.removeClass("fa-chevron-up")
                        glyph_element.removeClass("fa-check-circle")
                    })
                    state_element.attr("data-section-state", "hidden")
                }
                else {
                    let element_range = parent_element.nextUntil(`.magic-code-block-parent[data-action-name='section:end'][data-section-name='${name}']`).not(":last").filter(`[data-content-name='${name}']`)
                    element_range.not("[data-action-hidden='true']").show()
                    state_element.attr("data-section-state", "visible")
                    element_range.filter("[data-action-name][data-action-autostart]").trigger("click")
                }
            }
        },
        setup: (args, element) => {
            let parent_element = element
            let name = args.name || "*"
            if (generator.startsWith("Educates (asciidoc)")) {
                let root_element = parent_element.parent().parent()
                root_element.attr("data-section-name", name)
            }
            else
                parent_element.attr("data-section-name", name)
        },
        finish: (args, element, error) => {
            let parent_element = element
            let title_element = parent_element.prev()
            let state_element
            if (generator.startsWith("Educates (asciidoc)"))
                state_element = parent_element.parent().parent()
            else
                state_element = title_element
            let glyph_element = title_element.children(".magic-code-block-glyph")
            if (!error) {
                if (state_element.attr("data-section-state") == "visible") {
                    glyph_element.addClass("fa-chevron-up")
                    glyph_element.removeClass("fa-check-circle")
                    setTimeout(() => {
                        if (state_element.attr("data-section-state") == "visible") {
                            glyph_element.addClass("fa-check-circle")
                            glyph_element.removeClass("fa-chevron-up")
                        }
                    }, 1000)
                }
                else if (state_element.attr("data-section-state") == "hidden") {
                    glyph_element.addClass("fa-chevron-down")
                    glyph_element.removeClass("fa-chevron-up")
                    glyph_element.removeClass("fa-check-circle")
                }
            }
        }
    })

    register_action({
        name: "section:end",
        glyph: "fa-ban",
        args: "yaml",
        title: (args) => {
            return "Section: End"
        },
        body: (args) => {
            return ""
        },
        trigger: (args, element) => {
            let name = args.name || "*"
            if (generator.startsWith("Educates (asciidoc)")) {
                let root_element = element.parent().parent().prevAll(`.magic-code-block-root[data-action-name='section:begin'][data-section-name='${name}']`).first()
                let state_element = root_element
                if (state_element.attr("data-section-state") == "visible") {
                    let element_range = root_element.nextUntil(`.magic-code-block-root[data-action-name='section:end'][data-section-name='${name}']`)
                    element_range.hide()
                    $.each(element_range.filter("[data-section-state='visible']"), (_, target) => {
                        let section = $(target)
                        let glyph = section.find(".magic-code-block-glyph")
                        section.attr("data-section-state", "hidden")
                        glyph.addClass("fa-chevron-down")
                        glyph.removeClass("fa-chevron-up")
                        glyph.removeClass("fa-check-circle")
                    })
                    state_element.attr("data-section-state", "hidden")
                }
                else {
                    let element_range = root_element.nextUntil(`.magic-code-block-root[data-action-name='section:end'][data-section-name='${name}']`).filter(`[data-content-name='${name}']`)
                    element_range.show()
                    state_element.attr("data-section-state", "visible")
                }
            }
            else {
                // let root_element = element.parent().parent()
                let root_element = element
                let start_element = root_element.prevAll(`.magic-code-block-parent[data-action-name='section:begin'][data-section-name='${name}']`).first()
                let title_element = start_element.prev()
                let state_element = title_element
                if (state_element.attr("data-section-state") == "visible") {
                    let element_range = start_element.nextUntil(`.magic-code-block-parent[data-action-name='section:end'][data-section-name='${name}']`)
                    element_range.hide()
                    $.each(element_range.filter("[data-section-state='visible']"), (_, target) => {
                        let section_element = $(target)
                        let glyph_element = section_element.children(".magic-code-block-glyph")
                        section_element.attr("data-section-state", "hidden")
                        glyph_element.addClass("fa-chevron-down")
                        glyph_element.removeClass("fa-chevron-up")
                        glyph_element.removeClass("fa-check-circle")
                    })
                    state_element.attr("data-section-state", "hidden")
                }
                else {
                    let element_range = start_element.nextUntil(`.magic-code-block-parent[data-action-name='section:end'][data-section-name='${name}']`).not(":last").filter(`[data-content-name='${name}']`)
                    element_range.show()
                    state_element.attr("data-section-state", "visible")
                }
            }
        },
        handler: (args, element, done, fail) => {
            done()
        },
        setup: (args, element) => {
            let parent_element = element
            let name = args.name || "*"
            if (generator.startsWith("Educates (asciidoc)")) {
                let root_element = parent_element.parent().parent()
                root_element.attr("data-section-name", name)
                root_element.attr("data-content-name", name)
                let element_range = root_element.prevUntil(`.magic-code-block-root[data-action-name='section:begin'][data-section-name='${name}']`)
                let start = element_range.last().prev()
                if (start.data("action-name") == "section:begin" && start.data("section-name") == name) {
                    element_range.not("[data-content-name]").attr("data-content-name", name)
                    element_range.hide()
                    root_element.hide()
                }
            }
            else {
                parent_element.attr("data-section-name", name)
                parent_element.attr("data-content-name", name)
                let element_range = parent_element.prevUntil(`.magic-code-block-parent[data-action-name='section:begin'][data-section-name='${name}']`)
                let start = element_range.last().prev()
                if (start.data("action-name") == "section:begin" && start.data("section-name") == name) {
                    element_range.not("[data-content-name]").attr("data-content-name", name)
                    element_range.hide()
                    parent_element.hide()
                }
            }
        },
        pause: 0,
    })

    // Trigger autostart examiner actions at top level. 
    $("[data-action-autostart='true']").not("[data-content-name]").trigger("click")
})
