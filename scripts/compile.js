const solc = require('solc');
const fs = require('fs');
const path = require('path');

function findImports(importPath) {
  const remappings = [
    '@openzeppelin/=node_modules/@openzeppelin/',
  ];

  for (const remapping of remappings) {
    const [prefix, target] = remapping.split('=');
    if (importPath.startsWith(prefix)) {
      const resolvedPath = path.resolve(__dirname, '..', target, importPath.substring(prefix.length));
      if (fs.existsSync(resolvedPath)) {
        return { contents: fs.readFileSync(resolvedPath, 'utf8') };
      }
    }
  }
  
  // Fallback for relative paths
  const localPath = path.resolve(path.dirname(path.resolve(__dirname, '..', 'beatchain.sol')), importPath);
  if (fs.existsSync(localPath)) {
      return { contents: fs.readFileSync(localPath, 'utf8') };
  }

  return { error: `File not found: ${importPath}` };
}

function compileContract() {
  const contractPath = path.resolve(__dirname, '..', 'beatchain.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'beatchain.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi'],
        },
      },
      remappings: fs.readFileSync(path.resolve(__dirname, '..', 'remappings.txt'), 'utf8').split('\n').filter(Boolean),
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  if (output.errors) {
    let hasErrors = false;
    output.errors.forEach(err => {
      if (err.severity === 'error') {
        hasErrors = true;
        console.error(err.formattedMessage);
      }
    });
    if (hasErrors) return;
  }

  const contractABI = output.contracts['beatchain.sol']['BeatChain'].abi;
  const abiPath = path.resolve(__dirname, '..', 'lib', 'abi.json');
  
  if (!fs.existsSync(path.dirname(abiPath))) {
    fs.mkdirSync(path.dirname(abiPath), { recursive: true });
  }

  fs.writeFileSync(abiPath, JSON.stringify(contractABI, null, 2));
  console.log('ABI generated and saved to lib/abi.json');
}

compileContract();
