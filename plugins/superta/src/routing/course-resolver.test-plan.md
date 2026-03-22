# Course Resolver Test Plan

## Cases
- alias directly identifies course offering
- subject contains course code hint
- no route found -> ambiguous
- multiple conflicting hints -> ambiguous
- prior thread mapping overrides weak subject hint

## Assertions
- route confidence is surfaced
- ambiguous state blocks definitive routing
- output always includes professor id
