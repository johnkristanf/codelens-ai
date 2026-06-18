import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeLens AI is now active!');

  const sidebarProvider = new SidebarProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'codelens-ai.chatView',
      sidebarProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codelens-ai.helloWorld', () => {
      vscode.window.showInformationMessage('Hello from CodeLens AI!');
    })
  );
}

export function deactivate() {}
