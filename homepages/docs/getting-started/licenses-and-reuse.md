# Licenses and Reuse

Docs Path: `getting-started/licenses-and-reuse`
Artifact Code: PaperProof-generic_file-001169-e6430bc308e0
Series ID: 0xe6430bc308e089a258e31e7afe096bd8f0618fac1b3005794933700e010d5330
Comments Tree: locked

PaperProof lets authors choose a reuse license at publication time. The list
below covers the main options we expect to support in the Docs UX.

## Main Licenses

| License | Short name | Typical use |
|---|---|---|
| Creative Commons Attribution 4.0 | CC BY 4.0 | Broad reuse with attribution |
| Creative Commons Attribution-ShareAlike 4.0 | CC BY-SA 4.0 | Broad reuse, same-license sharing |
| Creative Commons Attribution-NonCommercial-ShareAlike 4.0 | CC BY-NC-SA 4.0 | Non-commercial reuse with sharing |
| Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 | CC BY-NC-ND 4.0 | Non-commercial reuse without derivatives |
| Creative Commons Zero 1.0 | CC0 1.0 | Public-domain-style dedication |
| MIT License | MIT | Simple permissive software release |
| Apache License 2.0 | Apache-2.0 | Permissive software and enterprise-friendly reuse |
| BSD 3-Clause License | BSD-3-Clause | Permissive software reuse with attribution |
| GNU GPL v3.0 | GPL-3.0 | Copyleft software release |
| PaperProof License | PPL | PaperProof platform distribution and reuse baseline |

## PaperProof License

`PPL` can be used as PaperProof's custom perpetual, non-exclusive license for
protocol-hosted artifacts. A practical shape is:

- PaperProof may store, index, render, cache, transmit, and format-convert the
  work for protocol operation;
- the author keeps copyright unless explicitly transferred elsewhere;
- the license is perpetual and non-exclusive;
- the license should not block normal public access to the versioned artifact.

This makes `PPL` useful when the author wants PaperProof hosting and protocol
distribution, but does not want to pick a public copyright license from the
standard catalog above.

## Choosing A License

- Docs, reports, and public-facing notes usually work well with `CC BY 4.0`.
- Community-reuse content can use `CC BY-SA 4.0`.
- Private or sensitive materials usually should not be published under a broad
  public license.
- Software releases often fit `MIT`, `Apache-2.0`, `BSD-3-Clause`, or `GPL-3.0`.
- `CC0 1.0` is the most open option when the author wants no reserved rights.

## Ownership And NFTs

If ownership is later bound to an NFT, transferring the NFT should change
control over future protocol actions, but it should not automatically rewrite
the license of already published versions.

In other words:

- NFT transfer changes controller rights;
- license choice stays attached to the published version unless the author
  republishes a new version under a different license;
- older versions keep their original license terms.
