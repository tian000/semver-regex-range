const toRegexRange = require('to-regex-range');

const toRegexRangeGreaterThanOrEqualTo = (minInclusiveNum: number) => {
    const minInclusive = minInclusiveNum.toString();
    const digits = minInclusive.length;
    const ninesWithSameDigits = new Array(digits).fill(9).join("");
    const regex = toRegexRange(minInclusive, ninesWithSameDigits, {capture: false, wrap: false});
    const numbersWithMoreDigits = `[1-9][0-9]{${digits},}`
    return regex + "|" + numbersWithMoreDigits;
}

const toSemverGreaterThanOrEqualTo = (major: number, minor: number, patch: number) => {
    const greaterThanMajorRegex = `(${toRegexRangeGreaterThanOrEqualTo(major + 1)})`;
    const greaterThanMinorRegex = `(${toRegexRangeGreaterThanOrEqualTo(minor + 1)})`;
    const greaterThanPatchRegex = `(${toRegexRangeGreaterThanOrEqualTo(patch + 1)})`;
    const anyPositiveNumber = "(0|[1-9][0-9]*)";
    // Major greater than criteria
    // or major equal and minor greater than critera
    // or major equal and minor equal and patch greater than.
    // or major equal and minor equal and patch equal to criteria
    const majorGreaterThan = `(${greaterThanMajorRegex}\\.${anyPositiveNumber}(\\.${anyPositiveNumber})+)`;
    const majorEqualMinorGreaterThan = `(${major.toString()}\\.${greaterThanMinorRegex}(\\.${anyPositiveNumber})+)`;
    const majorEqualMinorEqualPatchGreaterThan = `(${major.toString()}\\.${minor.toString()}\\.${greaterThanPatchRegex}(\\.${anyPositiveNumber})*)`;
    const majorEqualMinorEqualPatchEqual = `(${major.toString()}\\.${minor.toString()}\\.${patch.toString()}(\\.0)*)`;
    return [
        majorGreaterThan,
        majorEqualMinorGreaterThan,
        majorEqualMinorEqualPatchGreaterThan,
        majorEqualMinorEqualPatchEqual,
    ].reverse().join("|");
}

type Semver = {
    major: number,
    minor: number,
    patch: number,
}

function negateSemverRange(semverRegex: string): string {
    const anySemver = "((0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)(\\.(0|[1-9][0-9]*))+)";
    return `(?!(${semverRegex}))` + anySemver
}

function toSemverRange(greaterThanOrEqualTo: Semver, lessThanOrEqualTo?: Semver) {
    const gteq = toSemverGreaterThanOrEqualTo(greaterThanOrEqualTo.major, greaterThanOrEqualTo.minor, greaterThanOrEqualTo.patch);
    if (!lessThanOrEqualTo) {
        return gteq;
    }
    const lessThan = negateSemverRange(toSemverGreaterThanOrEqualTo(lessThanOrEqualTo.major, lessThanOrEqualTo.minor, lessThanOrEqualTo.patch));
    return `(?=(${gteq}))` + `(${lessThan})`;
}

const semverRange1 = toSemverRange({major: 23, minor: 17, patch: 0}, {major: 23, minor: 18, patch: 0});
console.log(semverRange1)

const semverRange2 = toSemverRange({major: 24, minor: 0, patch: 0});
console.log(semverRange2)