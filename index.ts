import fs from 'fs'
import crypto from 'crypto'
import { sys } from 'typescript';
import { parseArgs } from "util";
import { MerkleTree } from 'merkletreejs'
import { toUtf8 } from '@cosmjs/encoding';
import type { MintData } from './types';


const { values, positionals } = parseArgs({
  strict: true,
  args: Bun.argv,
  options: { 
    root: { type: 'boolean' },
    case: { type: 'string' },
    id: { type: 'string' },
  },
  allowPositionals: true,
});


function sha256(data : any) {
  return crypto.createHash('sha256').update(data).digest()
}


const test_case = values.case ?? "simple"
let id = values.id ?? positionals[3]


let metaRead;
try {
  metaRead =  fs.readFileSync(`./test_cases/${test_case}.json`, 'utf8')
} catch (err) {
  console.error(err)
  sys.exit(1)
}

const metadata : MintData[] = JSON.parse(metaRead!);
const metadataHashed = metadata.map((item) => sha256(toUtf8(JSON.stringify(item))))
const tree = new MerkleTree(metadataHashed, sha256, { sortPairs: true })
const root = tree.getRoot();

if (values.root) {
  console.log('root: ', root.toString('hex'))
  sys.exit(0)
}


if (!id) sys.exit(0)

const num = +id
if (isNaN(num)) {
  console.error('id must be numeric')
  sys.exit(1)
}
const index = metadata.findIndex((item) => item.token_id === num)
if (index === -1) {
  console.error('id not found')
  sys.exit(1)
}

const token = metadata[index]
const tokenHashed = metadataHashed[index]
const proof = tree.getHexProof(tokenHashed)


const mint_data : MintData = {
  token_id: token.token_id,
  metadata: token.metadata,
  proof_hashes: proof,
}

console.log('mint_data:', mint_data)
console.log('\nJSON string:\n')
console.log(JSON.stringify(mint_data))
console.log()

// let's do manual proof now:
/*
const proof_hashes = tree.getProof(tokenHashed).map((item) => item.data)
const init_data_hash = tokenHashed;

const final_hash = proof_hashes.reduce((accum_hash_slice, new_proof_hashstring) => {
  const hashe_slices = [accum_hash_slice, new_proof_hashstring];
  hashe_slices.sort();
  const final_hash = sha256(Buffer.concat(hashe_slices));
  return final_hash;
}, init_data_hash)

console.log('final_hash:', final_hash.toString('hex'))
console.log('root:', root.toString('hex'))
console.log('final_hash == root:', final_hash.equals(root))
*/