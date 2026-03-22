# Policy Engine Test Plan

## Cases
- ambiguous route forces `needs_more_info`
- grade-related classification forces `escalate_now`
- accommodation-sensitive classification forces `escalate_now`
- integrity-sensitive classification forces `escalate_now`
- wellbeing/safety classification forces `escalate_now`
- routine category with solid routing passes through unchanged

## Assertions
- deterministic overrides beat model preference
- sensitive categories never remain in a routine draft path
