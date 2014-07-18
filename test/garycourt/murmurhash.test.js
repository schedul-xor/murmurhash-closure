describe('garycourt.MurmurHash',function(){
  it('should return hash 3297245870 for string "saitama"',function(){
    // 'saitama' => [ 0, 115, 0, 97, 0, 105, 0, 116, 0, 97, 0, 109, 0, 97 ]
    var h = garycourt.MurmurHash.getInstance().mh3forString('saitama',1000);
    expect(h).to.be(3297245870);
  });

    it('should return hash 3125638387 for Unicode string "荻窪"',function(){
    var h = garycourt.MurmurHash.getInstance().mh3forString('荻窪',1000);
    expect(h).to.be(3125638387);
    });

  it('should return hash 2764721058 for 2865535333',function(){
    // 10101010110011001001100101100101 = 2865535333
    // 10101010 = 170
    // 11001100 = 204
    // 10011001 = 153
    // 01100101 = 101
    var h = garycourt.MurmurHash.getInstance().mh3forInt32s([2865535333],1000);
    expect(h).to.be(2764721058);
  });
});
