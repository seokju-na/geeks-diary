import { expect } from 'chai';
import { datetime, DateUnits } from './datetime';


describe('libs.datetime', () => {
    describe('copy', () => {
        it('should be different reference.', () => {
            const date = new Date();
            const copied = datetime.copy(date);

            expect(date).to.not.deep.equal(copied);
        });
    });

    describe('shortFormat', () => {
        it('should \'April 3, 2018\' dates short format to be \'18/04/03\'.', () => {
            const date = new Date(2018, 4 - 1, 3);

            expect(datetime.shortFormat(date)).to.equal('18-04-03');
        });
    });

    describe('add', () => {
        it('should added 1 month at \'May 31, 2018\' equals to \'June 30, 2018\'.', () => {
            const source = new Date(2018, 5 - 1, 31);
            const expected = new Date(2018, 6 - 1, 30);

            datetime.add(source, DateUnits.MONTH, 1);

            expect(source.getFullYear()).to.equal(expected.getFullYear());
            expect(source.getMonth()).to.equal(expected.getMonth());
            expect(source.getDate()).to.equal(expected.getDate());
        });

        it('should added 1 month at \'Dec 31, 2018\' equals to \'Jan 31, 2019\'.', () => {
            const source = new Date(2018, 12 - 1, 31);
            const expected = new Date(2019, 1 - 1, 31);

            datetime.add(source, DateUnits.MONTH, 1);

            expect(source.getFullYear()).to.equal(expected.getFullYear());
            expect(source.getMonth()).to.equal(expected.getMonth());
            expect(source.getDate()).to.equal(expected.getDate());
        });

        it('should added -1 month at \'Jan 1, 2019\' equals to \'Dec 1, 2018\'.', () => {
            const source = new Date(2019, 1 - 1, 1);
            const expected = new Date(2018, 12 - 1, 1);

            datetime.add(source, DateUnits.MONTH, -1);

            expect(source.getFullYear()).to.equal(expected.getFullYear());
            expect(source.getMonth()).to.equal(expected.getMonth());
            expect(source.getDate()).to.equal(expected.getDate());
        });
    });
});
