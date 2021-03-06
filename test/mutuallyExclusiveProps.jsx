import { expect } from 'chai';
import { any, bool } from 'prop-types';
import React from 'react';

import { mutuallyExclusiveProps } from '..';

import callValidator from './_callValidator';

describe('mutuallyExclusiveProps', () => {
  it('throws when not given a valid propType', () => {
    expect(() => mutuallyExclusiveProps()).to.throw(TypeError);
    expect(() => mutuallyExclusiveProps(null)).to.throw(TypeError);
    expect(() => mutuallyExclusiveProps({})).to.throw(TypeError);
    expect(() => mutuallyExclusiveProps([])).to.throw(TypeError);
  });

  it('throws when given 0 props', () => {
    expect(() => mutuallyExclusiveProps(any)).to.throw(TypeError);
  });

  it('returns a function', () => {
    expect(typeof mutuallyExclusiveProps(any, 'a', 'b')).to.equal('function');
  });

  function assertPasses(validator, element, propName) {
    expect(callValidator(validator, element, propName)).to.equal(null);
  }

  function assertFails(validator, element, propName) {
    expect(callValidator(validator, element, propName)).to.be.instanceOf(Error);
  }

  it('passes with one mutually exclusive prop', () => {
    assertPasses(
      mutuallyExclusiveProps(bool, 'b'),
      (<div a />),
      'a',
    );
    assertPasses(
      mutuallyExclusiveProps(bool, 'a'),
      (<div a />),
      'b',
    );
  });

  it('passes when mutually exclusive props are not both provided', () => {
    const prop1 = 'foo';
    const prop2 = 'bar';
    const validator = mutuallyExclusiveProps(bool, prop1, prop2);

    assertPasses(validator, <div a={false} />, 'a');
    assertPasses(validator.isRequired, <div a={false} />, 'a');

    assertPasses(validator, <div a={1} {...{ [prop1]: true }} />, prop1);
    assertPasses(validator.isRequired, <div a={1} {...{ [prop1]: true }} />, prop1);

    assertPasses(validator, <div a={1} {...{ [prop2]: true }} />, prop2);
    assertPasses(validator.isRequired, <div a={1} {...{ [prop2]: true }} />, prop2);
  });

  it('fails when the provided propType fails', () => {
    const prop1 = 'foo';
    const prop2 = 'bar';
    const validator = mutuallyExclusiveProps(bool, prop1, prop2);

    assertFails(validator, <div a={1} {...{ [prop1]: 1 }} />, prop1);
    assertFails(validator, <div a={1} {...{ [prop2]: 2 }} />, prop2);
  });

  it('fails when mutually exclusive props are provided', () => {
    const prop1 = 'foo';
    const prop2 = 'bar';
    const validator = mutuallyExclusiveProps(bool, prop1, prop2);

    assertFails(validator, <div a={1} {...{ [prop1]: true, [prop2]: true }} />, prop1);
    assertFails(validator, <div a={1} {...{ [prop1]: true, [prop2]: true }} />, prop2);
  });

  it('passes when one of the exclusive props is null/undefined', () => {
    const prop1 = 'foo';
    const prop2 = 'bar';
    const validator = mutuallyExclusiveProps(bool, prop1, prop2);
    assertPasses(validator, (<div foo bar={null} />), prop1);
    assertPasses(validator, (<div foo bar={null} />), prop2);
    assertPasses(validator, (<div bar foo={null} />), prop1);
    assertPasses(validator, (<div bar foo={null} />), prop2);
  });

  it('fails when required, and one of the exclusive props is null/undefined', () => {
    const prop1 = 'foo';
    const prop2 = 'bar';
    const validator = mutuallyExclusiveProps(bool, prop1, prop2).isRequired;
    assertFails(validator, (<div foo bar={null} />), prop2);
    assertFails(validator, (<div bar foo={null} />), prop1);
    assertFails(validator, (<div foo bar={undefined} />), prop2);
    assertFails(validator, (<div bar foo={undefined} />), prop1);
  });
});
