"use strict";
class StringHelper {
    capitalizeFirstLetter(strToCapitalize) {
        return strToCapitalize[0].toUpperCase() + strToCapitalize.slice(1);
    }
    seperateCharectersUponUppercase(strInput, firstCap) {
        if (firstCap) {
            return this.capitalizeFirstLetter(strInput.split(/(?=[A-Z])/).join(" "));
        }
        return strInput.split(/(?=[A-Z])/).join(" ");
    }
}
class ObjectHelperClass {
    getObjectValue(obj, key) {
        try {
            let arr = key.split(".");
            let maxIterations = 100;
            let iterations = 0;
            let res = obj;
            while (arr.length !== 0 && iterations < maxIterations) {
                iterations++;
                res = res[arr[0]];
                arr.shift();
            }
            return res;
        }
        catch (e) {
            console.warn(`Skipped object ${obj} with key ${key}`);
            return;
        }
    }
}
class HtmlTool {
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
    matchWithErrorHandle(str, regStr) {
        try {
            let res = str.match(new RegExp(regStr));
            res = res ? res[0] : '';
            this.cacheStr = res;
            return res;
        }
        catch (e) {
            console.warn(e);
        }
    }
    matchAll(str, regex) {
        let match = str.match(new RegExp(regex, 'g'));
        return match;
    }
    getMatchCounts(str, regex) {
        let regexMatchArray = this.matchAll(str, regex);
        if (regexMatchArray)
            return regexMatchArray.length;
        return 0;
    }
    replaceWithErrorHandle(str, regStr, repVal, text = false) {
        try {
            if (text) {
                return str.replace(text, repVal).trim();
            }
            return str.replace(new RegExp(regStr), repVal).trim();
        }
        catch (e) {
            console.warn(e);
        }
    }
    matchNReplace(inputStr, regexp) {
        let match, replacedStr;
        match = this.matchWithErrorHandle(inputStr, regexp);
        replacedStr = this.replaceWithErrorHandle(inputStr, regexp, '');
        // replacedStr = inputStr.replace(match,'');
        return [match, replacedStr];
    }
    extractHtmlTag(str, tag, attr = "", noCloseTag = false) {
        const tagRegexp = this.getTagRegexp(tag, attr, noCloseTag);
        return this.matchWithErrorHandle(str, tagRegexp);
    }
    extractHtmlTag2(str, tag, attr = "", noCloseTag = false) {
        const tagRegexp = this.getTagRegexp2(tag, attr, noCloseTag);
        return this.matchWithErrorHandle(str, tagRegexp);
    }
    extractHtmlValue(tag) {
        return this.matchWithErrorHandle(tag, `(?<=>)${this.any}(?=<)`);
    }
    extractAttributeValue(attr) {
        if (attr == null) {
            console.warn("Undefined attribute value");
            return;
        }
        attr = attr.replace(/\s/g, '');
        return this.matchWithErrorHandle(attr, `(?<=")${this.any}(?=")`);
    }
    extractAttribute(html, name, value = '', last = false) {
        const attrRegex = this.getAttrRegex(name, value, last);
        return this.matchWithErrorHandle(html, attrRegex);
    }
    extractAllTagWithAttr(html, tag, attr = '') {
        let match;
        let tagArray = [];
        while (this.isPresent(html, this.getTagRegexp(tag, attr))) {
            [match, html] = this.matchNReplace(html, this.getTagRegexp(tag, attr));
            tagArray.push(match);
        }
        return tagArray;
    }
    getTagRegexp(tag, attr = "", noCloseTag = false) {
        if (noCloseTag)
            return `<${tag + this.closeTag + this.any}${attr}${this.any}>`;
        if (attr !== "") {
            return `<${tag + this.any + attr + this.any + '>' + this.any}</${tag}>`;
        }
        return `<${tag + this.closeTag + this.any}</${tag}>`;
    }
    getTagRegexp2(tag, attr = "", noCloseTag = false) {
        if (noCloseTag)
            return `<${tag + this.closeTag + this.any}${attr}${this.any}>`;
        if (attr !== "") {
            return `<${tag + this.any2 + attr + this.any + '>' + this.any}</${tag}>`;
        }
        return `<${tag + this.closeTag + this.any}</${tag}>`;
    }
    getAttrRegex(name, value = '', last = false) {
        let regex = `${name + this.nSpace}=${this.nSpace}"${this.any + value + this.any}"`;
        if (last) {
            return `${regex}(?![.\S\n]*${name})`;
        }
        return regex;
    }
    getReplaceAttrRegex(attrName) {
        return `${attrName + this.nSpace + '=' + this.nSpace + '"' + this.any + '"'}`;
    }
    removeAttribute(html, attrName) {
        let regex = this.getReplaceAttrRegex(attrName);
        return this.replaceWithErrorHandle(html, regex, '');
    }
    addAttribute(html, attr) {
        let regex = "(?<=<.+?\\s+?)";
        return this.replaceWithErrorHandle(html, regex, "" + attr + " ");
    }
    replaceValueOfTag(html, value) {
        let regex = `(?<=<${this.any}>)${this.any}(?=</${this.any}>)`;
        return this.replaceWithErrorHandle(html, regex, value);
    }
}
class HtmlFormatter {
    formatHTML(html, newLineNum = 1, tabNum = 1) {
        let indent = '\n'.repeat(newLineNum);
        let tab = '\t'.repeat(tabNum);
        let i = 0;
        let pre = [];
        html = html.replace(/[\n\t]/g, '');
        html = html
            .replace(new RegExp('<pre>((.|\\t|\\n|\\r)+)?</pre>'), function (x) {
            pre.push({ indent: '', tag: x });
            return '<--TEMPPRE' + i++ + '/-->';
        })
            .replace(new RegExp('<([^<>]+|ngIf=\\s*?["\'].*?[<>].*?["\'])>[^<]?', 'g'), function (x) {
            let ret;
            let tag = /<\/?([^\s/>]+)/.exec(x);
            if (tag)
                tag = tag[1];
            let p = new RegExp('<--TEMPPRE(\\d+)/-->').exec(x);
            if (p)
                pre[p[1]].indent = indent;
            if (['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'].indexOf(tag) >= 0) // self closing tag
                ret = indent + x;
            else {
                if (x.indexOf('<!--') != -1) {
                    // For comment
                    ret = indent + x;
                }
                else if (x.indexOf('</') < 0) { //open tag
                    if (x.charAt(x.length - 1) !== '>')
                        ret = indent + x.substr(0, x.length - 1) + indent + tab + x.substr(x.length - 1, x.length);
                    else
                        ret = indent + x;
                    !p && (indent += tab);
                }
                else { //close tag
                    indent = indent.substr(0, indent.length - 1);
                    if (x.charAt(x.length - 1) !== '>')
                        ret = indent + x.substr(0, x.length - 1) + indent + x.substr(x.length - 1, x.length);
                    else
                        ret = indent + x;
                }
            }
            return ret;
        });
        for (i = pre.length; i--;) {
            html = html.replace('<--TEMPPRE' + i + '/-->', pre[i].tag.replace('<pre>', '<pre>\n').replace('</pre>', pre[i].indent + '</pre>'));
        }
        return html.charAt(0) === '\n' ? html.substr(1, html.length - 1) : html;
    }
}
