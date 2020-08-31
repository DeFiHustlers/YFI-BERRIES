const { expectRevert } = require('@openzeppelin/test-helpers');
const BerryToken = artifacts.require('BerryToken');

contract('BerryToken', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.berry = await BerryToken.new({ from: alice });
    });

    it('should have correct name and symbol and decimal', async () => {
        const name = await this.berry.name();
        const symbol = await this.berry.symbol();
        const decimals = await this.berry.decimals();
        assert.equal(name.valueOf(), 'BerryToken');
        assert.equal(symbol.valueOf(), 'BERRY');
        assert.equal(decimals.valueOf(), '18');
    });

    it('should only allow owner to mint token', async () => {
        await this.berry.mint(alice, '100', { from: alice });
        await this.berry.mint(bob, '1000', { from: alice });
        await expectRevert(
            this.berry.mint(carol, '1000', { from: bob }),
            'Ownable: caller is not the owner',
        );
        const totalSupply = await this.berry.totalSupply();
        const aliceBal = await this.berry.balanceOf(alice);
        const bobBal = await this.berry.balanceOf(bob);
        const carolBal = await this.berry.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '100');
        assert.equal(bobBal.valueOf(), '1000');
        assert.equal(carolBal.valueOf(), '0');
    });

    it('should supply token transfers properly', async () => {
        await this.berry.mint(alice, '100', { from: alice });
        await this.berry.mint(bob, '1000', { from: alice });
        await this.berry.transfer(carol, '10', { from: alice });
        await this.berry.transfer(carol, '100', { from: bob });
        const totalSupply = await this.berry.totalSupply();
        const aliceBal = await this.berry.balanceOf(alice);
        const bobBal = await this.berry.balanceOf(bob);
        const carolBal = await this.berry.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '90');
        assert.equal(bobBal.valueOf(), '900');
        assert.equal(carolBal.valueOf(), '110');
    });

    it('should fail if you try to do bad transfers', async () => {
        await this.berry.mint(alice, '100', { from: alice });
        await expectRevert(
            this.berry.transfer(carol, '110', { from: alice }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.berry.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });
  });
