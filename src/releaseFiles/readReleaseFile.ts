import yaml from "js-yaml";
import {
  ReleaseFilePaths,
  Manifest,
  AllowedFormats,
  ReleaseFileType,
  SetupWizard,
  Compose
} from "../types";
import { readFile } from "../utils/file";
import { parseFormat } from "../utils/parseFormat";
import { findReleaseFilePath } from "./findReleaseFilePath";

type ComposeOrManifestOrSetupWizard<
  T extends
    | ReleaseFileType.compose
    | ReleaseFileType.manifest
    | ReleaseFileType.setupWizard
> = T extends ReleaseFileType.compose
  ? Compose
  : T extends ReleaseFileType.manifest
  ? Manifest
  : SetupWizard;

/**
 * Reads a release file. Without arguments defaults to read the release file at './dappnode_package.json' | './setup-wizard.yml' | './docker-compose.yml'
 */
export function readReleaseFile<
  T extends
    | ReleaseFileType.compose
    | ReleaseFileType.manifest
    | ReleaseFileType.setupWizard
>(
  releaseFileType: T,
  paths?: ReleaseFilePaths
): {
  releaseFile: ComposeOrManifestOrSetupWizard<T>;
  releaseFileFormat: AllowedFormats;
} {
  // Figure out the path and format
  const releaseFilePath = findReleaseFilePath(releaseFileType, paths);
  if (releaseFileType === ReleaseFileType.setupWizard && !releaseFilePath)
    return {
      releaseFile: {} as ComposeOrManifestOrSetupWizard<T>,
      releaseFileFormat: AllowedFormats.yml
    };
  const releaseFileFormat = parseFormat(releaseFilePath);
  const data = readFile(releaseFilePath);

  // Parse release file in try catch block to show a comprehensive error message
  try {
    return {
      releaseFileFormat,
      releaseFile: yaml.load(data)
    };
  } catch (e) {
    throw Error(`Error parsing ${releaseFileType} : ${e.message}`);
  }
}
