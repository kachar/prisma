import { $ } from 'zx'

async function main() {
  try {
    // produce build packages that can be consumed directly inside the docker container
    await $`cd ${__dirname}/../../../../cli && sed -i 's/__bundleDependencies/bundleDependencies/g' package.json`
    await $`cd ${__dirname}/../../../../cli && pnpm pack --pack-destination ${__dirname}/../`
    await $`cd ${__dirname}/../../../../cli && sed -i 's/bundleDependencies/__bundleDependencies/g' package.json`
    await $`cd ${__dirname}/../../../../client && pnpm pack --pack-destination ${__dirname}/../`
  } catch (e) {
    console.log(e.message)
    console.log('🛑 Failed to pack one or more of the packages')
    console.log('💡 Make sure to run `watch`, `dev` or `build`')
  }

  await $`docker compose -f ${__dirname}/docker-compose.yml build >/dev/null 2>&1`
  await $`docker compose -f ${__dirname}/docker-compose.yml down >/dev/null 2>&1`
  await $`docker compose -f ${__dirname}/docker-compose.yml up >/dev/null 2>&1`

  const findErrors = await $`find "$(pwd)" -not -name .logs.0.txt -name .logs.*.txt`.quiet()
  const errors = findErrors.stdout.split('\n').filter((v) => v.length > 0)
  if (errors.length > 0) {
    console.log(`🛑 ${errors.length} tests failed:`, errors)
  } else {
    console.log(`✅ All tests passed`)
  }
}

void main()
