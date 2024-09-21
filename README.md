# Metadata-Minter Test Scripts

To install dependencies:

```bash
bun install
```

To run:

```bash
# print merkle root of the tree
bun run index.ts --root

# show mint data of a specific token_id:
bun run index.ts --id 5
```
##  Customising:
Add your json file or edit existing files in `test_cases` folder and refer to the file with --case:
```
bun run index.ts --case "simple" --id 5
```

All the fields in the metadata object must be in the same order as defined in standard [metadata](https://github.com/kromsten/launchpad/blob/kromsten/metadata-contracts/packages/sg-metadata/src/lib.rs#L17) structure
