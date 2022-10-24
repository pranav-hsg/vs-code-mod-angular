
// Class which is used to point out js functions and methods. It can analyze a ".ts / .js" file to spot particular methods 
// This can be used to remove methods or add methods.
export class ParseJS {
  // select everything including space and new line, non-space and space regex string.
  any = `[.\\n\\S\\s]*?`;
  // select everything including space and new line regex string leaving non-space.
  any2 = `[.\\n\\s]*?`;
  nSpace = `[\\s\\n]*?`;
  closeTag = `[>\\n\\s\\t]+?`;
  cacheStr = "";
  isPresent(string: string, reg: string) {
    return string.match(new RegExp(reg)) ? true : false;
  }
  matchWithErrorHandle(str: string, regStr: string, flags: string = "") :string{
    try {
      // match string with regexp with flags
      let res: any = str.match(new RegExp(regStr, flags));
      // If you get match return string else return empty string
      res = res ? res[0] : "";
      // cache the string
      this.cacheStr = res;
      return res;
    } catch (e) {
      console.warn(e);
    }
    return "";
  }
  matchWithErrorHandleIndex(str: string, regStr: string, flags: string = "") {
    // similar as matchWithErrorHandle but returns entire match instead of string
    try {
      let res: any = str.match(new RegExp(regStr, flags));
      res = res ? res : "";
      this.cacheStr = res;
      return res;
    } catch (e) {
      console.warn(e);
    }
  }
  // Returns match string array else returns null
  matchAll(str: string, regex: string) :Array<string> | null{
    let match = str.match(new RegExp(regex, "g"));
    return match;
  }
  getMatchCounts(str: string, regex: string):number {
    // Gets match count
    let regexMatchArray = this.matchAll(str, regex) // gets Array<string>;
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
  matchNReplace(inputStr: string, regexp: string):Array<string> {
    let match, replacedStr;
    match = this.matchWithErrorHandle(inputStr, regexp);
    replacedStr = this.replaceWithErrorHandle(inputStr, regexp, "", "");
    // replacedStr = inputStr.replace(match,'');
    return [match, replacedStr];
  }
  getSpaceBeforeFunctionRegex(name: string) { 
    // Capture number of spaces before a method/function
    // name is a function or method name
    return `^[^\n]*?(?=${name + this.any}\\(${this.any}\\)${this.any}\\{${
      this.any
    }$)`;
  }
  getStartingSpacesOfFunc(str: string, name: string) {
    // Get regexp for space match 
    // returns like "    ";
    let regex = this.getSpaceBeforeFunctionRegex(name);
    // multiline match
    let match = str.match(new RegExp(regex, "m"));
    if (match) {
      return match[0].split(" ").length - 1;
    } else {
      return null;
    }
  }
  getOCRegex(nSpace: number, name: string) {
    // name -> function name 
    // space before function starting.
    // Spaces regex likes
    // spaces<Function-Name>{<anything>
    // spaces}
    // This is the main regex to select / detect function
    return (
      "^" +
      "\\s".repeat(nSpace) +
      `${name}[.\\n\\s\\t]*?[\\S]{0,3}[.\\n\\s\\t]*?\\{[.\\n\\s\\S\\t]*?[.\\n\\s\\S\\t]*?^${"\\s".repeat(
        nSpace
      )}\\}`
    );
  }
  getMethodRegex(html: string, name: string) {
    // Number of starting spaces before function
    let n = <number>this.getStartingSpacesOfFunc(html, name);
    // Get method regex by passing number of spaces
    let regex = this.getOCRegex(n, name);
    return regex;
  }
  getMethod(html: string, name: string): string {
    // Capture method by name. Basically it grabs by getting spaces before(start) and after function(end).
    let regex = this.getMethodRegex(html, name);
    // Multiline match to make '^' work on each line in regexp
    // There are many "^"(start of line) in ocregex if multi line mode is not there the "^" only works on start of entire string instead of matching working on each line of entire string multi line.
    let match = this.matchWithErrorHandle(html, regex, "m");
    return match;
  }
  replaceMethod(html: string, name: string, repMethod: string): string {
    // First get regular expression for a particular method
    let regex = this.getMethodRegex(html, name);
    // Replace the method with replace method
    let match: string = this.replaceWithErrorHandle(
      html,
      regex,
      "m",
      repMethod
    );
    // Return replaced version of string( Here string may include entire file).
    return match;
  }
  insert(str:string, index:number, value:string) {
    return str.substr(0, index) + value + str.substr(index);
  }
  findClassEnd(text:string):number{
    // Find end of particular class 
    let lastBrace =  text.lastIndexOf('}');
    return lastBrace ? lastBrace : -1 ;
  }
  findClassStart(text:string):number{
    // Find the start of class in string.(Entire file contents)
    let classStart =  this.matchWithErrorHandleIndex(text,`(?<=class${this.any}\\{)[.\\n\\s\\S]`);
    return classStart? classStart.index : -1;
  }
  addMethod(text:string,method:string){
    // Add method to end of class
    let i = this.findClassEnd(text);
    return this.insert(text,i,'\n'+method);
  }
  addAttribute(text:string,attr:string){
    // Add attribute at the start of the class
    let i = this.findClassStart(text);
    return this.insert(text,i,'\n'+attr);
  }
  removeMethod(text:string,name:string){
    // Remove methods
    let regex = this.getMethodRegex(text, name);
    let repStr = this.replaceWithErrorHandle(text, regex, "m",'');
    return repStr;
  }
}
