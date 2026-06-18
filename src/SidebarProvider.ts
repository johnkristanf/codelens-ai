import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'onInfo': {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case 'onError': {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case 'chatMessage': {
          if (!data.value) {
            return;
          }
          
          // Call Ollama API
          try {
            const response = await fetch('http://127.0.0.1:11434/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'llama3', // Or another default Ollama model like mistral, phi3
                messages: [{ role: 'user', content: data.value }],
                stream: false
              }),
            });

            if (!response.ok) {
              throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const result = await response.json() as any;
            const reply = result.message?.content || 'No response from Ollama.';
            
            webviewView.webview.postMessage({
              type: 'chatResponse',
              value: reply,
            });
          } catch (err: any) {
            vscode.window.showErrorMessage(`Failed to connect to Ollama. Make sure Ollama is running locally. Error: ${err.message}`);
            webviewView.webview.postMessage({
              type: 'chatResponse',
              value: `Error: Could not connect to Ollama. Please ensure Ollama is installed and running locally.`,
            });
          }
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js')
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeLens AI</title>
        <script>
          const tsvscode = acquireVsCodeApi();
        </script>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
