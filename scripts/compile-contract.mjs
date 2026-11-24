import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import solc from 'solc'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = await readFile(path.join(root, 'contracts/ProofOfExistence.sol'), 'utf8')
const input = {
  language: 'Solidity',
  sources: { 'ProofOfExistence.sol': { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
  },
}
const output = JSON.parse(solc.compile(JSON.stringify(input)))
const errors = output.errors?.filter((entry) => entry.severity === 'error') ?? []
if (errors.length > 0) {
  throw new Error(errors.map((entry) => entry.formattedMessage).join('\n'))
}
const compiled = output.contracts?.['ProofOfExistence.sol']?.ProofOfExistence
if (!compiled?.evm.bytecode.object) throw new Error('Solidity compiler returned no deployment bytecode.')
const artifact = {
  contractName: 'ProofOfExistence',
  compilerVersion: solc.version(),
  abi: compiled.abi,
  bytecode: `0x${compiled.evm.bytecode.object}`,
}
await writeFile(path.join(root, 'src/models/ProofOfExistenceArtifact.json'), `${JSON.stringify(artifact, null, 2)}\n`)
process.stdout.write(`Compiled ProofOfExistence (${solc.version()}) to src/models/ProofOfExistenceArtifact.json\n`)
