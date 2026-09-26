# Taste Match

Taste Match compares the relative order of titles that two users have both ranked.

## Why pairwise order

Watchnotes rankings can have different lengths. Comparing raw position numbers directly can be misleading when one user has ranked 20 movies and another has ranked 200.

Instead, Taste Match looks at every pair of shared titles and asks:

```text
Did both users put title A above title B?
```

The match percentage is the percentage of those shared pairwise preferences that agree.

Example:

```text
Shared titles: A, B, C

User 1: A > B > C
User 2: A > C > B

Pair results:
A vs B = agree
A vs C = agree
B vs C = disagree

Taste Match = 67%
```

A score appears after at least three shared ranked titles. With fewer than three, the UI shows the overlap but does not present a percentage.

## Agreements and disagreements

For title-level callouts, Watchnotes compares each shared title's normalized position within each user's full ranking.

This allows the UI to show:

- closest agreements
- biggest disagreements
- each user's actual rank for the title

## API

```text
GET /social/profiles/:username/taste-match/:type
```

The endpoint requires authentication because one side of the comparison is always the signed-in user's ranking.

`:type` is `movie` or `tv`.

## Database

No migration is required for this feature. It calculates matches from the public ranking data already introduced by the social-profile milestone.
