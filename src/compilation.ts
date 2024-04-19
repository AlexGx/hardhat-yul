import { Artifact, Artifacts, ProjectPathsConfig } from "hardhat/types";
import type { Artifacts as ArtifactsImpl } from "hardhat/internal/artifacts";
import { localPathToSourceName } from "hardhat/utils/source-names";
import path from "path";
import solc from "solc";
import * as fs from "fs";
import { YulConfig, YulArtifacts } from "./types";
import util from "util";

export async function compileYul(
  _yulConfig: YulConfig,
  paths: ProjectPathsConfig,
  artifacts: Artifacts,
  yulArtifacts: YulArtifacts 
) {
  const files = await getYulSources(paths);

  const allArtifacts = [];
  for (const file of files) {
    const cwdPath = path.relative(process.cwd(), file);

    console.log(`Compiling ${cwdPath}...`);

    const yulOutput = await _compileYul(cwdPath, file);

    const sourceName = await localPathToSourceName(paths.root, file);
    const artifact = getArtifactFromYulOutput(sourceName, yulOutput);

    const { contractName } = artifact;
    // IFF the user defined a yulArtifact
    if (Boolean(yulArtifacts) && contractName in yulArtifacts) {
      artifact.abi = yulArtifacts[contractName].abi;
      console.log(`Using ABI from yulArtifacts for ${contractName}`);
    }

    await artifacts.saveArtifactAndDebugFile(artifact);
    allArtifacts.push({ ...artifact, artifacts: [artifact.contractName] });

    const artifactsImpl = artifacts as ArtifactsImpl;
    artifactsImpl.addValidArtifacts(allArtifacts);
  }
}

async function getYulSources(paths: ProjectPathsConfig) {
  const glob = await import("glob");
  const yulFiles = glob.sync(path.join(paths.sources, "**", "*.yul"));

  return yulFiles;
}

function pathToContractName(file: string) {
  const sourceName = path.basename(file);
  return sourceName.substring(0, sourceName.indexOf("."));
}

function getArtifactFromYulOutput(sourceName: string, output: any): Artifact {
  const contractName = pathToContractName(sourceName);

  return {
    _format: "hh-sol-artifact-1", // sig"function add()" makes this work
    contractName,
    sourceName,
    abi: [], // FIXME: create a proper abi which will work with typechain etc...
    bytecode: output.bytecode,
    deployedBytecode: output.bytecode_runtime,
    linkReferences: {},
    deployedLinkReferences: {},
  };
}

async function _compileYul(filepath: string, filename: string) {
  const data = fs.readFileSync(filepath, "utf8");
  const output = JSON.parse(
    solc.compile(
      JSON.stringify({
        language: "Yul",
        sources: { "Target.yul": { content: data } },
        settings: {
          outputSelection: { "*": { "*": ["*"], "": ["*"] } },
          optimizer: {
            enabled: true,
            runs: 0,
            details: {
              yul: true,
            },
          },
        },
      })
    )
  );
  if (output.errors && output.errors.length > 0) {
    throw new Error(
      `hardhat-yul: error compiling ${filename}: ${util.inspect(
        output,
        false,
        null,
        true
      )}`
    );
  }
  const contractObjects = Object.keys(output.contracts["Target.yul"]);
  const bytecode =
    "0x" +
    output.contracts["Target.yul"][contractObjects[0]]["evm"]["bytecode"][
      "object"
    ];
  const deployedBytecode =
    "0x" +
    output.contracts["Target.yul"][contractObjects[0]]["evm"]["deployedBytecode"][
      "object"
    ];

  const contractCompiled = {
    _format: "hh-sol-artifact-1",
    sourceName: filename,
    abi: [], // needs to be an empty array to not cause issues with typechain
    bytecode: bytecode,
    bytecode_runtime: deployedBytecode,
  };

  return contractCompiled;
}
