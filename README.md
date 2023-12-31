# GPT CoBuilder

GPT CoBuilder is a graphical user interface (GUI) tool that helps you quickly create and iterate on applications using the power of GPT-based language models. It helps autofill prompts with files.

Later it should be easy to share system and user/request prompts.
Even later it should be able to automatically apply the changes it suggests.

## Screenshots
![Screen 1](readmeimages/screen1.png?raw=true)

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
5. Click the "Run full workflow button" or use one of the individual buttons

## Plans
- Have multiple types of agents who do their own things
- Agent asking clarification
- Agent writing documentation
- Agent writing change requests
- Agent writing user stories
- Agent simulating a user
- Agent that debugs
- Make it easy to share prompts/outputs/agents

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