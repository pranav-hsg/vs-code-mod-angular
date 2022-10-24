"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const jsParse_1 = require("./utils/jsParse");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
let pj;
function init() {
    pj = new jsParse_1.ParseJS();
}
function activate(context) {
    init();
    let disposable = vscode.commands.registerCommand('codemod.detailsTS', () => {
        let attr2Add = `
		@Input() id = '';
		@Output() close = new EventEmitter();
		@Output() edit = new EventEmitter();

		`;
        let m2rpl = `
		previousState() {
			if(this.id) this.close.emit('')
			else window.history.back();
		}`;
        vscode.commands.executeCommand("editor.action.format");
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            let document = editor.document;
            const documentText = document.getText();
            let text = documentText;
            let invalidRange = new vscode.Range(0, 0, editor.document.lineCount, 0);
            // To ensure that above range is completely contained in this document.
            let validFullRange = editor.document.validateRange(invalidRange);
            text = text.replace(`this.load(params['id']);`, `if (params['id']) this.load(params['id']);else this.load(this.id);`);
            text = pj.addAttribute(text, attr2Add);
            text = pj.replaceMethod(text, 'previousState', m2rpl);
            console.log(text);
            editor.edit(editBuilder => {
                editBuilder.replace(validFullRange, text);
                vscode.commands.executeCommand("editor.action.format");
            });
        }
        vscode.window.showInformationMessage('Hello World from codemods!');
    });
    let disposable2 = vscode.commands.registerCommand('codemod.listTS', () => {
        let lm2add = `
					openModal(type: string, id?: string) {
			      console.log(type,id)
			      if (type == 'view') {
			        this.currentTemplate = this.viewDetailTemplate;
			      } else if (type == 'edit') {
			        this.currentTemplate = this.editTemplate;
			      }
			      this.id = id;
			      this.isModal = true;
			    }`;
        let att2Add = ` 
			
		   @ViewChild('detail') viewDetailTemplate: TemplateRef<any>;
		   @ViewChild('edit') editTemplate: TemplateRef<any>;
		   currentTemplate: TemplateRef<any>;
			 id: string='';
			 isModal: boolean=false;
			 `;
        vscode.commands.executeCommand("editor.action.format");
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            let document = editor.document;
            const documentText = document.getText();
            let text = documentText;
            let invalidRange = new vscode.Range(0, 0, editor.document.lineCount, 0);
            // To ensure that above range is completely contained in this document.
            let validFullRange = editor.document.validateRange(invalidRange);
            text = pj.addMethod(text, lm2add);
            text = pj.addAttribute(text, att2Add);
            console.log(pj.getMethod(documentText, 'ngOnInit'));
            editor.edit(editBuilder => {
                editBuilder.replace(validFullRange, text);
                vscode.commands.executeCommand("editor.action.format");
                vscode.commands.executeCommand("autoimport.autoComplete");
            });
        }
        vscode.window.showInformationMessage('Hello World from codemods!');
    });
    let disposable3 = vscode.commands.registerCommand('codemod.listHTML', () => {
        let html2Add = `
		<div class="modal-container" *ngIf="isModal">
			<div class="modal-box">
				<ng-container *ngTemplateOutlet="currentTemplate"></ng-container>
			</div>
		</div>
		<ng-template #detail>
			<jhi-casaproduct-detail [id]="id" (edit)="openModal('edit', $event)" (close)="isModal = false"></jhi-casaproduct-detail>
		</ng-template>
		<ng-template #edit>
			<jhi-casaproduct-detail [id]="id" (close)="isModal = false"></jhi-casaproduct-detail>
		</ng-template>
		`;
        vscode.commands.executeCommand("editor.action.format");
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            let document = editor.document;
            const documentText = document.getText();
            let text = documentText;
            let invalidRange = new vscode.Range(0, 0, editor.document.lineCount, 0);
            // To ensure that above range is completely contained in this document.
            let validFullRange = editor.document.validateRange(invalidRange);
            text = text + '\n' + html2Add;
            console.log(pj.getMethod(documentText, 'ngOnInit'));
            editor.edit(editBuilder => {
                editBuilder.replace(validFullRange, text);
                vscode.commands.executeCommand("editor.action.format");
            });
        }
        vscode.window.showInformationMessage('Hello World from codemods!');
    });
    context.subscriptions.push(disposable2);
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable3);
}
exports.activate = activate;
// // this method is called when your extension is deactivated
// export function deactivate() {}
// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "codemod" is now active!');
// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	let disposable = vscode.commands.registerCommand('codemod.helloWorld', () => {
// 		vscode.commands.executeCommand("editor.action.format");
// 		// The code you place here will be executed every time your command is executed
// 		// Display a message box to the user
// 		const editor = vscode.window.activeTextEditor;
// 		if (editor) {
// 				let document = editor.document;
// 				// Get the document text
// 				const documentText = document.getText();
// 				// DO SOMETHING WITH `documentText`
// 				console.log(documentText);
// 				//Creating a new range with startLine, startCharacter & endLine, endCharacter.
// 				let invalidRange = new vscode.Range(0, 0, editor.document.lineCount, 0);
// 				// To ensure that above range is completely contained in this document.
// 				let validFullRange = editor.document.validateRange(invalidRange);
// 				console.log(pj.getMethod(documentText,'ngOnInit'));
// 				// editor.edit(editBuilder => {
// 				// 	editBuilder.replace(validFullRange, '');
// 				// });
// 		}
// 		vscode.window.showInformationMessage('Hello World from codemods!');
// 	});
