"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseJS = void 0;
class ParseJS {
    constructor() {
        this.any = `[.\\n\\S\\s]*?`;
        this.any2 = `[.\\n\\s]*?`;
        this.nSpace = `[\\s\\n]*?`;
        this.closeTag = `[>\\n\\s\\t]+?`;
        this.cacheStr = "";
    }
    isPresent(string, reg) {
        return string.match(new RegExp(reg)) ? true : false;
    }
    matchWithErrorHandle(str, regStr, flags = "") {
        try {
            let res = str.match(new RegExp(regStr, flags));
            res = res ? res[0] : "";
            this.cacheStr = res;
            return res;
        }
        catch (e) {
            console.warn(e);
        }
    }
    matchWithErrorHandleIndex(str, regStr, flags = "") {
        try {
            let res = str.match(new RegExp(regStr, flags));
            res = res ? res : "";
            this.cacheStr = res;
            return res;
        }
        catch (e) {
            console.warn(e);
        }
    }
    matchAll(str, regex) {
        let match = str.match(new RegExp(regex, "g"));
        return match;
    }
    getMatchCounts(str, regex) {
        let regexMatchArray = this.matchAll(str, regex);
        if (regexMatchArray)
            return regexMatchArray.length;
        return 0;
    }
    replaceWithErrorHandle(str, regStr, flags, repVal, text = false) {
        try {
            if (text) {
                return str.replace(text, repVal).trim();
            }
            return str.replace(new RegExp(regStr, flags), repVal).trim();
        }
        catch (e) {
            console.warn(e);
            return str;
        }
    }
    matchNReplace(inputStr, regexp) {
        let match, replacedStr;
        match = this.matchWithErrorHandle(inputStr, regexp);
        replacedStr = this.replaceWithErrorHandle(inputStr, regexp, "", "");
        // replacedStr = inputStr.replace(match,'');
        return [match, replacedStr];
    }
    getSpaceBeforeFunctionRegex(name) {
        return `^[^\n]*?(?=${name + this.any}\\(${this.any}\\)${this.any}\\{${this.any}$)`;
    }
    getStartingSpacesOfFunc(str, name) {
        let regex = this.getSpaceBeforeFunctionRegex(name);
        let match = str.match(new RegExp(regex, "m"));
        if (match) {
            return match[0].split(" ").length - 1;
        }
        else {
            return null;
        }
    }
    getOCRegex(nSpace, name) {
        return ("^" +
            "\\s".repeat(nSpace) +
            `${name}[.\\n\\s\\t]*?[\\S]{0,3}[.\\n\\s\\t]*?\\{[.\\n\\s\\S\\t]*?[.\\n\\s\\S\\t]*?^${"\\s".repeat(nSpace)}\\}`);
    }
    getMethodRegex(html, name) {
        let n = this.getStartingSpacesOfFunc(html, name);
        let regex = this.getOCRegex(n, name);
        return regex;
    }
    getMethod(html, name) {
        let regex = this.getMethodRegex(html, name);
        let match = this.matchWithErrorHandle(html, regex, "m");
        return match;
    }
    replaceMethod(html, name, repMethod) {
        let regex = this.getMethodRegex(html, name);
        let match = this.replaceWithErrorHandle(html, regex, "m", repMethod);
        return match;
    }
    insert(str, index, value) {
        return str.substr(0, index) + value + str.substr(index);
    }
    findClassEnd(text) {
        let lastBrace = text.lastIndexOf('}');
        return lastBrace ? lastBrace : -1;
    }
    findClassStart(text) {
        let classStart = this.matchWithErrorHandleIndex(text, `(?<=class${this.any}\\{)[.\\n\\s\\S]`);
        return classStart ? classStart.index : -1;
    }
    addMethod(text, method) {
        let i = this.findClassEnd(text);
        return this.insert(text, i, '\n' + method);
    }
    addAttribute(text, attr) {
        let i = this.findClassStart(text);
        return this.insert(text, i, '\n' + attr);
    }
    removeMethod(text, name) {
        let regex = this.getMethodRegex(text, name);
        let repStr = this.replaceWithErrorHandle(text, regex, "m", '');
        return repStr;
    }
}
exports.ParseJS = ParseJS;
//# sourceMappingURL=jsParse.js.map