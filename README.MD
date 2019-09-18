# Passo a passo para implementar IBM Cloud Functions

## Como funciona uma IBM Cloud Function?

Uma IBM Cloud Function é uma parte do seu código que roda em um ambiente escalável onde é faturado por tempo de uso em segundos.

O Cálculo é baseado em tempo de processamento e consumo de mémoria RAM.

**Funciona da seguinte forma:**

1. Uma parte do seu código fica registrado em um Cloud Function (Independente da técnologia javascript Python etc)
2. É acionado via rest API, trigger ou schedule.
3. Ao ser acionada é executada aquela parte do código gerando uma saída.
4. Pode ser configurados em sequências quando trabalho for muito grande, onde um cloud function aciona a próxima até chegar no resultado.

**Pode ser integrado ao próprio código do projeto, não sendo necessário dar manutenção em dois código**

## Analisando a viabiliadade de uso

É necessário verificar a real necessidade de se aplicar IBM Cloud Function, como ter certeza disso?

1 - Primeiramente é comendado que IBM Cloud Function seja apenas um método, ou uma sequência de métodos quando o trabalho for muito grande.

2 - Quando esse método irá consumir grande poder de processamento e memoria.

3 - Quando for necessário orquestrar uma fila para não sobregarrecar o sistema.

4 - Quando se pode ter ou terá um grande volume de acesso que podem sobrecarregar o sistema.

## Aplicando IBM Cloud Function no meu projeto.

Documentação como integrar serveless com IBM Cloud Function: https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/

Documentação de como usar o serverless:
https://serverless.com/framework/docs/getting-started/

Documentação do openwhisk
https://github.com/serverless/serverless-openwhisk

Documentação para uso de ES6 e ou ES7
https://medium.com/@kilgarenone/write-es6-es7-in-serverless-framework-using-babel-7-and-webpack-4-5bd742168e1a

1. Instalando framework serverless

```javascript
npm install -g serverless
```

2. Instalando dependência do serverless openwisk no projeto

```javascript
npm install serverless-openwhisk --save-dev
npm install serverless-webpack --save-dev
```

3. Configurando credênciais de acesso a IBM cloud

```javascript
//instalando ibmcloud
curl -fsSL https://clis.ng.bluemix.net/install/linux | sh

//se estiver usando mac
curl -fsSL https://clis.ng.bluemix.net/install/osx | sh

//instalando pacote de fuctions
ibmcloud plugin install Cloud-Functions -r Bluemix

// fazendo login na ibm
ibmcloud login -a <REGION_API> -o <INSERT_USER_ORGANISATION> -s <SPACE>

//dados de acesso disponível no link: https://cloud.ibm.com/functions/learn/cli

//configurando plugin openwhisk
ibmcloud wsk property get --auth
```

4. Criando minha primeira function

```javascript
//abra pasta do seu projeto
cd <MY-PROJECT>

//crie o serviço usando o template
serverless create --template openwhisk-nodejs --path <MY_FOLDER-IN-PROJECT>

//abra MY_FOLDER-IN-PROJECT
cd <MY_FOLDER-IN-PROJECT>

//instale as dependencias
npm install --save source-map-support
npm install --save-dev @babel/cli@^7.0.0
npm install --save-dev @babel/core@^7.0.1
npm install --save-dev @babel/preset-env@^7.0.0
npm install --save-dev babel-loader@^8.0.0
npm install --save-dev babel-plugin-source-map-support@^2.0.1
npm install --save-dev serverless-webpack@^5.2.0
npm install --save-dev webpack@^4.18.0
npm install --save-dev webpack-node-externals@^1.7.2
npm install
```

5. Observe que foi criado dentro do diretório arquivos bases de uma function pronta.

5.1. Os arquivos mais importantes são serverless.yml e handler.js

5.2. serverless.yml são instruções para construir a function dentro do sistema exemplo:

```javascript
service: companies

provider:
  name: openwhisk
  runtime: nodejs:default

functions:
  companyCreate:
    handler: handler.create
    annotations:
      web-export: false
    events:
      - http:
          method: post
          path: /companies/create

resources:
  apigw:
    auth:
      key: X-IBM-NUCONT //name of key using during request

plugins:
  - serverless-openwhisk
  - serverless-webpack

package:
  individually: true

custom:
  webpack:
    webpackConfig: ./webpack.config.js
    includeModules: true


```

5.3. handler.js é nosso arquivo javascript que rodará no nodejs. Podemos usar uma function ou chamar um classe

```javascript
"use strict";

class companies {
    constructor() {}

    showform(data) {
        return {
            message: "Your post",
            data: data
        };
    }
}

const myCompanies = new companies();

exports.create = (params) => {
    return myCompanies.showform(params);
};
```
5.4. Crie o arquivo de configuração .babelrc

```javascript

{
  "plugins": ["source-map-support"],
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "8.10"
        }
      }
    ]
  ]
}
```

5.5. Crie o arquivo de configuração do webpack.config.js

```javascript
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  // Generate sourcemaps for proper error messages
  devtool: 'source-map',
  // Since 'aws-sdk' is not compatible with webpack,
  // we exclude all node dependencies
  externals: [nodeExternals()],
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  optimization: {
    // We no not want to minimize our code.
    minimize: false,
  },
  performance: {
    // Turn off size warnings for entry points
    hints: false,
  },
  // Run babel on all .js files and skip those in node_modules
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: __dirname,
        exclude: /node_modules/,
      },
    ],
  },
};
```
6. Para fazer o deploy da function

```javascript
serverless deploy
```

7. Vá até o painel IBM na instancia functions, em API e depois em SHARING e crie uma key para ser usada na requisição da API. A key deve estar em uma variável de ambiente por segurança.

7.1 Chamando a api usando Meteor

```javascript
// use meteor add http
import { HTTP } from 'meteor/http';

HTTP.call('POST', 'API_URL', {
  headers: {
      "X-IBM-NUCONT": "API KEY item 7."
  },
  data: { 
    some: 'json', 
    stuff: 1 
  }
}, (error, result) => {
  if (error) {
     console.log("Error: ", error);
  } else {
    console.log("Result: ", result)
  }
});

``` 
