# GPT CoBuilder

GPT CoBuilder is a graphical user interface (GUI) tool that helps you quickly create and iterate on applications using the power of GPT-based language models. It helps autofill prompts with files.

Later it should be easy to share system and user/request prompts.
Even later it should be able to automatically apply the changes it suggests.

## Screenshots
![Screen 1](readmeimages/screen1.png?raw=true)
 
![Screen 2](readmeimages/screen2.png?raw=true)

## Getting Started

To run the project, follow these steps:

1. Clone the repository: `git clone https://github.com/Squarific/gpt-cobuilder.git`
2. Navigate to the project directory: `cd gpt-cobuilder`
3. Install dependencies: `npm install`
4. Start the application: `npm start`

## Usage

1. Enter your ChatGPT API Key in the input field provided.
2. Select a folder by clicking the "Select a Folder" button and choosing the desired directory.
3. Choose relevant files for what you are trying to accomplish.
4. Enter a project description in the "Project Description" textarea. *Optional*
5. Customize the system message *optional* and user message/request according to your needs.
6. Click the "Generate GPT Completion" button to trigger GPT completion.
7. The generated message will be displayed in the "Generated Message" textarea.

## Tips

- Sometimes less is more, but sometimes you may need to provide more context to get the desired output.
- Review and edit the generated message to suit your specific requirements.

## Plans
- Stream response
- Read response and transform into a change suggestion
- Maybe keep some statistics like total token count ever
- Somehow automatically apply the change suggestions
- By default open the files/folder of this project
- Change the folder selection to use nodejs
- Remember last folder selection
- Save prompts in project folder
- Git integration including automatically committing/pushing
- Save outputs to files or some kind of memory
- Save prompts to files or some kind of memery
- Be able to put previous outputs back in
- Make it easy to share prompts/outputs
- Have a big library of prompts that can be picked from
- Let GPT pick the prompts itself

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please read our [Contribution Guidelines](CONTRIBUTING.md) for more details.

## Feedback and Support

For feedback, bug reports, or support, please open an issue on the [GitHub repository](https://github.com/Squarific/gpt-cobuilder/issues).

## Acknowledgements

This project uses the following open-source libraries:

- Electron: [https://www.electronjs.org/](https://www.electronjs.org/)
- OpenAI API: [https://www.openai.com/](https://www.openai.com/)
- Gitignore Parser: [https://www.npmjs.com/package/gitignore-parser](https://www.npmjs.com/package/gitignore-parser)

This readme and most of the application was cowritten by this chatGPT and this very program.