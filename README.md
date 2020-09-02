[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Pipeline](https://github.com/duck-duck-tag/duck-duck-tag/workflows/Pipeline/badge.svg)

# duck-duck-tag

or \***\*Tools for automated image analysis\*\*** in social sciences shall hatch into a researcher-friendly desktop application. This application will allow sending images for tagging via multiple image recognition services, for example IBM Watson and Microsoft Azure. When the image recognition process is complete, the application shows tags and their accuracy. You can also export the data in CSV, JSON, and SQLite format. 

The application is being built on the specification and requirement provided by Matti Nelimarkka from the University of Helsinki. Here is a link to the client's blog post about the issue [in Finnish](https://rajapinta.co/2020/02/24/onko-maailma-erilainen-riippuen-siita-kenen-tekoaly-sita-katselee/)

The work started on top of an existing [boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate), and a lot of the functionality was first built here. Later, we built our own boilerplate, moved the functionality to [another repository](https://github.com/duck-duck-tag/novelty-boilerplate) under this organization and continued the work there.


## Table of Contents

- [Implementation](#implementation)
- [Running the app locally](#running-the-app-locally)
- [Usage](#usage)
- [Documentation](#documentation)
- [License](#license)

## Implementation

This project will be a [TypeScript](https://www.typescriptlang.org/) application utilizing [Electron](https://www.electronjs.org/) and [ReactJS](https://reactjs.org/)

## Running the app locally

Requirements: [Yarn](https://yarnpkg.com/)

```bash
git clone https://github.com/duck-duck-tag/duck-duck-tag
cd duck-duck-tag
yarn install
yarn dev
```

## Usage

1. Open app

2. Go to 'analyze images'

3. Give image url and your API-key and -endpoint

4. Send image by pushing analyze image with Azure **or** with IBM -button

5. Receive tags and accuracies

6. Export data to CSV-file

## Documentation

- [Definition of done](https://github.com/duck-duck-tag/duck-duck-tag/blob/master/DefinitionOfDone.md)
- [Product backlog](https://docs.google.com/spreadsheets/d/1ypMfZBOHwcXqzx_ehelTg8syBYQba85UtAmK6r7JvH8/edit?usp=sharing)
- [Hour accounting](https://docs.google.com/spreadsheets/d/1ypMfZBOHwcXqzx_ehelTg8syBYQba85UtAmK6r7JvH8/edit#gid=1685552279)
- [Sprint task board](https://github.com/duck-duck-tag/duck-duck-tag/projects)

**Communication is mainly managed through the medium of**

- [Discord App](https://discord.com/)

## License

Code is under the [MIT License](https://github.com/ubikampus/ubilocation-server/blob/master/LICENSE)

---

**_the Kwackening!_**
