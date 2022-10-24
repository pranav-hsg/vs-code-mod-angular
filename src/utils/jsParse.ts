
export class ParseJS {
  any = `[.\\n\\S\\s]*?`;
  any2 = `[.\\n\\s]*?`;
  nSpace = `[\\s\\n]*?`;
  closeTag = `[>\\n\\s\\t]+?`;
  cacheStr = "";
  isPresent(string: string, reg: string) {
    return string.match(new RegExp(reg)) ? true : false;
  }
  matchWithErrorHandle(str: string, regStr: string, flags: string = "") {
    try {
      let res: any = str.match(new RegExp(regStr, flags));
      res = res ? res[0] : "";
      this.cacheStr = res;
      return res;
    } catch (e) {
      console.warn(e);
    }
  }
  matchWithErrorHandleIndex(str: string, regStr: string, flags: string = "") {
    try {
      let res: any = str.match(new RegExp(regStr, flags));
      res = res ? res : "";
      this.cacheStr = res;
      return res;
    } catch (e) {
      console.warn(e);
    }
  }
  matchAll(str: string, regex: string) {
    let match = str.match(new RegExp(regex, "g"));
    return match;
  }
  getMatchCounts(str: string, regex: string) {
    let regexMatchArray = this.matchAll(str, regex);
    if (regexMatchArray) return regexMatchArray.length;
    return 0;
  }
  replaceWithErrorHandle(
    str: string,
    regStr: string,
    flags: string,
    repVal: string,
    text: boolean | string = false
  ): string {
    try {
      if (text) {
        return str.replace(<string>text, repVal).trim();
      }
      return str.replace(new RegExp(regStr, flags), repVal).trim();
    } catch (e) {
      console.warn(e);
      return str;
    }
  }
  matchNReplace(inputStr: string, regexp: string) {
    let match, replacedStr;
    match = this.matchWithErrorHandle(inputStr, regexp);
    replacedStr = this.replaceWithErrorHandle(inputStr, regexp, "", "");
    // replacedStr = inputStr.replace(match,'');
    return [match, replacedStr];
  }
  getSpaceBeforeFunctionRegex(name: string) {
    return `^[^\n]*?(?=${name + this.any}\\(${this.any}\\)${this.any}\\{${
      this.any
    }$)`;
  }
  getStartingSpacesOfFunc(str: string, name: string) {
    let regex = this.getSpaceBeforeFunctionRegex(name);
    let match = str.match(new RegExp(regex, "m"));
    if (match) {
      return match[0].split(" ").length - 1;
    } else {
      return null;
    }
  }
  getOCRegex(nSpace: number, name: string) {
    return (
      "^" +
      "\\s".repeat(nSpace) +
      `${name}[.\\n\\s\\t]*?[\\S]{0,3}[.\\n\\s\\t]*?\\{[.\\n\\s\\S\\t]*?[.\\n\\s\\S\\t]*?^${"\\s".repeat(
        nSpace
      )}\\}`
    );
  }
  getMethodRegex(html: string, name: string) {
    let n = <number>this.getStartingSpacesOfFunc(html, name);
    let regex = this.getOCRegex(n, name);
    return regex;
  }
  getMethod(html: string, name: string): string {
    let regex = this.getMethodRegex(html, name);
    let match = this.matchWithErrorHandle(html, regex, "m");
    return match;
  }
  replaceMethod(html: string, name: string, repMethod: string): string {
    let regex = this.getMethodRegex(html, name);
    let match: string = this.replaceWithErrorHandle(
      html,
      regex,
      "m",
      repMethod
    );
    return match;
  }
  insert(str:string, index:number, value:string) {
    return str.substr(0, index) + value + str.substr(index);
  }
  findClassEnd(text:string):number{
    let lastBrace =  text.lastIndexOf('}');
    return lastBrace ? lastBrace : -1 ;
  }
  findClassStart(text:string):number{
    let classStart =  this.matchWithErrorHandleIndex(text,`(?<=class${this.any}\\{)[.\\n\\s\\S]`);
    return classStart? classStart.index : -1;
  }
  addMethod(text:string,method:string){
    let i = this.findClassEnd(text);
    return this.insert(text,i,'\n'+method);
  }
  addAttribute(text:string,attr:string){
    let i = this.findClassStart(text);
    return this.insert(text,i,'\n'+attr);
  }
  removeMethod(text:string,name:string){
    let regex = this.getMethodRegex(text, name);
    let repStr = this.replaceWithErrorHandle(text, regex, "m",'');
    return repStr;
  }
}
