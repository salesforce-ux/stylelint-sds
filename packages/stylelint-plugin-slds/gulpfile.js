import { series, src, dest } from 'gulp';
import { rimraf} from 'rimraf'
import {task} from "gulp-execa";
import * as esbuild from 'esbuild'

/**
 * Clean all generated folder
 * @returns 
 */
function cleanDirs(){
    return rimraf(['build', 'publish']);
}

 /**
  * Compile typescript files
  * */ 
const compileTs = async ()=>{
  await esbuild.build({
    entryPoints: ["./src/index.ts"],
    bundle:true,
    outdir:"build",
    platform: "node",
    format:"esm",
    packages:'external'
  })
};
  
export const build = series(cleanDirs, compileTs);

export default task('gulp --tasks');