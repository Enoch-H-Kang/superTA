export async function runLiveResponsesFixtureComparison() {
  throw new Error(
    'Live external-model fixture comparison is no longer part of the supported SuperTA workflow.',
  );
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  runLiveResponsesFixtureComparison()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
