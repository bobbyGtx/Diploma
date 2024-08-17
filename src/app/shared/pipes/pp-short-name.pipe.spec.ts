import { PpShortNamePipe } from './pp-short-name.pipe';

describe('PpShortNamePipe', () => {

  it('should only Name', () => {
    const testString:string = 'Имя Фамилия';
    const pipe = new PpShortNamePipe();
    const result=pipe.transform(testString);
    expect(result).toBe('Имя');
  });
  it('should length only 12 symbols', () => {
    const testString:string = 'Нупростооченьдлиннаястрокасименемпользователя';
    const pipe = new PpShortNamePipe();
    const result=pipe.transform(testString);
    expect(result.length).toBe(12);
  });
  it('should enter equal exit', () => {
    const testString:string = 'Простоеимя';
    const pipe = new PpShortNamePipe();
    const result=pipe.transform(testString);
    expect(result).toBe(testString);
  });

});
