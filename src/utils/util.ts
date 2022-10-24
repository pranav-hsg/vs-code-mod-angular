class StringHelper{
  capitalizeFirstLetter(strToCapitalize: string | any[]) {
    return strToCapitalize[0].toUpperCase() + strToCapitalize.slice(1);
  }
  seperateCharectersUponUppercase(strInput: string, firstCap: any) {
    if (firstCap) {
      return this.capitalizeFirstLetter(strInput.split(/(?=[A-Z])/).join(" "));
    }
    return strInput.split(/(?=[A-Z])/).join(" ");
  }
}
class ObjectHelperClass{
  getObjectValue(obj: any, key: string) {
    try{

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
    }catch(e){
      console.warn(`Skipped object ${obj} with key ${key}`);
      return
    }
  }
}

class HtmlTool{
  any = `[.\\n\\S\\s]*?`
  any2 = `[.\\n\\s]*?`
  nSpace = `[\\s\\n]*?`
  closeTag=`[>\\n\\s\\t]+?`
  cacheStr = ""
  isPresent(string: string,reg: string | RegExp){
    return string.match(new RegExp(reg)) ? true : false; 
  }
  matchWithErrorHandle(str: string,regStr: string | RegExp){
    try{
      let res:any = str.match(new RegExp(regStr));
      res = res ? res[0] : '';
      this.cacheStr = res;
      return res
    }catch(e){
      console.warn(e);
    }
  }
  matchAll(str: string,regex: string ){
    let match =str.match(new RegExp(regex,'g'));
    return match;
  }
  getMatchCounts(str: string,regex: string){
    let regexMatchArray = this.matchAll(str,regex);
    if(regexMatchArray) return regexMatchArray.length; 
    return 0;
  }
  replaceWithErrorHandle(str: string,regStr: string | RegExp,repVal: string,text:boolean|string=false){
    try{
      if(text){ return str.replace(<string>text,repVal).trim() }
      return str.replace(new RegExp(regStr),repVal).trim()
    }catch(e){
      console.warn(e);
    }
  }
  matchNReplace(inputStr: string,regexp: string | RegExp){
    let match,replacedStr;
    match = this.matchWithErrorHandle(inputStr,regexp)
    replacedStr=this.replaceWithErrorHandle(inputStr,regexp,'')
    // replacedStr = inputStr.replace(match,'');
    return [match,replacedStr];
  }
  extractHtmlTag(str: any,tag: any,attr="",noCloseTag=false){
    const tagRegexp = this.getTagRegexp(tag,attr,noCloseTag);
    return this.matchWithErrorHandle(str,tagRegexp);
  }
  extractHtmlTag2(str: any,tag: any,attr="",noCloseTag=false){
    const tagRegexp = this.getTagRegexp2(tag,attr,noCloseTag);
    return this.matchWithErrorHandle(str,tagRegexp);
  }
  extractHtmlValue(tag:string){
    return this.matchWithErrorHandle(tag,`(?<=>)${this.any}(?=<)`);
  }
  extractAttributeValue(attr: string | null){
    if(attr==null) {console.warn("Undefined attribute value");return;}
    attr = attr.replace(/\s/g,'')
    return this.matchWithErrorHandle(attr,`(?<=")${this.any}(?=")`);
  }
  extractAttribute(html: any,name: any,value='',last=false){
    const attrRegex = this.getAttrRegex(name,value,last);
      return this.matchWithErrorHandle(html,attrRegex);
  }
  extractAllTagWithAttr(html: any,tag: any,attr: string | undefined=''){
    let match;
    let tagArray = []
    while(this.isPresent(html,this.getTagRegexp(tag,attr))){
      [ match,html ] = this.matchNReplace(html,this.getTagRegexp(tag,attr)) 
      tagArray.push(match);    
    }
    return tagArray;
  }
  getTagRegexp(tag: string,attr="",noCloseTag=false) { 
    if(noCloseTag) return `<${tag+this.closeTag+this.any}${attr}${this.any}>`
    if(attr!==""){ return `<${tag+this.any+attr+this.any+'>'+this.any}</${tag}>`;}
    return `<${tag+this.closeTag+this.any}</${tag}>`
  }
  getTagRegexp2(tag: string,attr="",noCloseTag=false) { 
    if(noCloseTag) return `<${tag+this.closeTag+this.any}${attr}${this.any}>`
    if(attr!==""){ return `<${tag+this.any2+attr+this.any+'>'+this.any}</${tag}>`;}
    return `<${tag+this.closeTag+this.any}</${tag}>`
  }
  getAttrRegex(name: string,value='',last=false){
    let regex = `${name+this.nSpace}=${this.nSpace}"${this.any+value+this.any}"`
    if(last){
      return `${regex}(?![.\S\n]*${name})`
    }
    return regex
  }
  getReplaceAttrRegex(attrName: string){
    return `${attrName+this.nSpace+'='+this.nSpace+'"'+this.any+'"'}`
  }
  removeAttribute(html: any,attrName: any){
    let regex = this.getReplaceAttrRegex(attrName);
    return this.replaceWithErrorHandle(html,regex,'')
  }
  addAttribute(html: any,attr: string){
    let regex = "(?<=<.+?\\s+?)"
    return this.replaceWithErrorHandle(html,regex,""+attr+" ")
  }
  replaceValueOfTag(html: any,value: any){
    let regex = `(?<=<${this.any}>)${this.any}(?=</${this.any}>)`
    return this.replaceWithErrorHandle(html,regex,value)
  }
}
class HtmlFormatter{
  formatHTML(html: string,newLineNum=1,tabNum=1) {
    let indent = '\n'.repeat(newLineNum);
    let tab = '\t'.repeat(tabNum);
    let i = 0;
    let pre: { indent: string; tag:any }[] = [];
    html = html.replace(/[\n\t]/g,'')
    html = html
        .replace(new RegExp('<pre>((.|\\t|\\n|\\r)+)?</pre>'), function (x: any) {
            pre.push({ indent: '', tag: x });
            return '<--TEMPPRE' + i++ + '/-->'
        })
        .replace(new RegExp('<([^<>]+|ngIf=\\s*?["\'].*?[<>].*?["\'])>[^<]?', 'g'), function (x: string) {
            let ret;
            let tag:any = /<\/?([^\s/>]+)/.exec(x);
            if(tag) tag= tag[1];
            let p:any = new RegExp('<--TEMPPRE(\\d+)/-->').exec(x);

            if (p) 
                pre[p[1]].indent = indent;

            if (['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'].indexOf(tag) >= 0) // self closing tag
                ret = indent + x;
            else {
                if(x.indexOf('<!--')!= -1){
                    // For comment
                    ret = indent + x
                }else if (x.indexOf('</') < 0) { //open tag
                    if (x.charAt(x.length - 1) !== '>')
                        ret = indent + x.substr(0, x.length - 1) + indent + tab + x.substr(x.length - 1, x.length);
                    else 
                        ret = indent + x;
                    !p && (indent += tab);
                }
                else {//close tag
                    indent = indent.substr(0, indent.length - 1);
                    if (x.charAt(x.length - 1) !== '>')
                        ret =  indent + x.substr(0, x.length - 1) + indent + x.substr(x.length - 1, x.length);
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